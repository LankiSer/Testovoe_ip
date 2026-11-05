-- CRM: profiles, objects, tasks, immutable status history, RLS, transitions

create extension if not exists pgcrypto;

create type public.user_role as enum ('manager', 'executor');
create type public.task_status as enum (
  'new',
  'in_progress',
  'review',
  'accepted',
  'rework'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.user_role not null,
  created_at timestamptz not null default now()
);

create table public.objects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  object_id uuid references public.objects (id) on delete cascade,
  title text not null,
  description text not null default '',
  assignee_id uuid references public.profiles (id),
  status public.task_status not null default 'new',
  author_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  from_status public.task_status,
  to_status public.task_status not null,
  changed_by uuid not null references public.profiles (id),
  comment text,
  created_at timestamptz not null default now()
);

create index tasks_object_id_idx on public.tasks (object_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index task_status_history_task_id_idx on public.task_status_history (task_id);

-- Helpers (security definer, locked search_path)
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'manager'
  );
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.current_user_role() from anon;
revoke all on function public.is_manager() from public;
revoke all on function public.is_manager() from anon;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_manager() to authenticated;

-- Auto profile from auth.users (role must be set via admin / seed; default executor)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  v_role := coalesce(
    (new.raw_app_meta_data ->> 'role')::public.user_role,
    'executor'
  );

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    v_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block direct status updates unless flagged by transition RPC
create or replace function public.tasks_enforce_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and old.status is distinct from new.status
     and coalesce(current_setting('app.allow_status_change', true), '') is distinct from 'on'
  then
    raise exception 'Смена статуса только через transition_task';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger tasks_enforce_status_change
  before update on public.tasks
  for each row execute function public.tasks_enforce_status_change();

-- History on create
create or replace function public.tasks_after_insert_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_status_history (
    task_id, from_status, to_status, changed_by, comment
  ) values (
    new.id, null, new.status, new.author_id, null
  );
  return new;
end;
$$;

create trigger tasks_after_insert_history
  after insert on public.tasks
  for each row execute function public.tasks_after_insert_history();

-- Allowed transitions
create or replace function public.transition_task(
  p_task_id uuid,
  p_to_status public.task_status,
  p_comment text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks;
  v_role public.user_role;
  v_uid uuid := auth.uid();
  v_from public.task_status;
  v_comment text := nullif(trim(coalesce(p_comment, '')), '');
begin
  if v_uid is null then
    raise exception 'Не авторизован';
  end if;

  select role into v_role from public.profiles where id = v_uid;
  if v_role is null then
    raise exception 'Профиль не найден';
  end if;

  select * into v_task from public.tasks where id = p_task_id for update;
  if not found then
    raise exception 'Задача не найдена';
  end if;

  v_from := v_task.status;

  if v_from = p_to_status then
    raise exception 'Статус уже установлен';
  end if;

  if not (
    (v_from = 'new' and p_to_status = 'in_progress'
      and v_role = 'executor' and v_task.assignee_id = v_uid)
    or (v_from = 'in_progress' and p_to_status = 'review'
      and v_role = 'executor' and v_task.assignee_id = v_uid)
    or (v_from = 'review' and p_to_status = 'accepted' and v_role = 'manager')
    or (v_from = 'review' and p_to_status = 'rework' and v_role = 'manager')
    or (v_from = 'rework' and p_to_status = 'in_progress'
      and v_role = 'executor' and v_task.assignee_id = v_uid)
  ) then
    raise exception 'Переход % → % запрещён для текущей роли', v_from, p_to_status;
  end if;

  if p_to_status = 'rework' and v_comment is null then
    raise exception 'Для возврата на доработку нужен комментарий';
  end if;

  perform set_config('app.allow_status_change', 'on', true);

  update public.tasks
  set status = p_to_status, updated_at = now()
  where id = p_task_id
  returning * into v_task;

  insert into public.task_status_history (
    task_id, from_status, to_status, changed_by, comment
  ) values (
    p_task_id, v_from, p_to_status, v_uid, v_comment
  );

  return v_task;
end;
$$;

revoke all on function public.transition_task(uuid, public.task_status, text) from public;
revoke all on function public.transition_task(uuid, public.task_status, text) from anon;
grant execute on function public.transition_task(uuid, public.task_status, text) to authenticated;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
revoke all on function public.tasks_after_insert_history() from public;
revoke all on function public.tasks_after_insert_history() from anon;
revoke all on function public.tasks_after_insert_history() from authenticated;
revoke all on function public.tasks_enforce_status_change() from public;
revoke all on function public.tasks_enforce_status_change() from anon;
revoke all on function public.tasks_enforce_status_change() from authenticated;

-- RLS
alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

-- profiles
create policy profiles_select_authenticated
  on public.profiles for select to authenticated
  using (true);

create policy profiles_update_own
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles p where p.id = auth.uid())
  );

-- objects
create policy objects_select
  on public.objects for select to authenticated
  using (
    public.is_manager()
    or exists (
      select 1 from public.tasks t
      where t.object_id = objects.id and t.assignee_id = auth.uid()
    )
  );

create policy objects_insert_manager
  on public.objects for insert to authenticated
  with check (public.is_manager() and created_by = auth.uid());

create policy objects_update_manager
  on public.objects for update to authenticated
  using (public.is_manager())
  with check (public.is_manager());

create policy objects_delete_manager
  on public.objects for delete to authenticated
  using (public.is_manager());

-- tasks
create policy tasks_select
  on public.tasks for select to authenticated
  using (
    public.is_manager()
    or assignee_id = auth.uid()
  );

create policy tasks_insert_manager
  on public.tasks for insert to authenticated
  with check (
    public.is_manager()
    and author_id = auth.uid()
    and status = 'new'
  );

create policy tasks_update_manager_fields
  on public.tasks for update to authenticated
  using (public.is_manager())
  with check (public.is_manager());

create policy tasks_delete_manager
  on public.tasks for delete to authenticated
  using (public.is_manager());

-- history: select if can see task; no insert/update/delete for clients
create policy history_select
  on public.task_status_history for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_status_history.task_id
        and (public.is_manager() or t.assignee_id = auth.uid())
    )
  );

-- updated_at for objects
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon;
revoke all on function public.set_updated_at() from authenticated;

create trigger objects_set_updated_at
  before update on public.objects
  for each row execute function public.set_updated_at();

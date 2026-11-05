alter table public.tasks alter column object_id drop not null;

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
  v_is_assignee boolean;
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
  v_is_assignee := v_task.assignee_id = v_uid;

  if v_from = p_to_status then
    raise exception 'Статус уже установлен';
  end if;

  if not (
    (v_from = 'new' and p_to_status = 'in_progress' and v_is_assignee)
    or (v_from = 'in_progress' and p_to_status = 'review' and v_is_assignee)
    or (v_from = 'review' and p_to_status = 'accepted' and v_role = 'manager')
    or (v_from = 'review' and p_to_status = 'rework' and v_role = 'manager')
    or (v_from = 'rework' and p_to_status = 'in_progress' and v_is_assignee)
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

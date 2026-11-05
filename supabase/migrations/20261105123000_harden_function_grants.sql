revoke all on function public.current_user_role() from public;
revoke all on function public.current_user_role() from anon;
grant execute on function public.current_user_role() to authenticated;

revoke all on function public.is_manager() from public;
revoke all on function public.is_manager() from anon;
grant execute on function public.is_manager() to authenticated;

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

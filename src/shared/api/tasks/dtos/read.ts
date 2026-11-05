import type { TaskStatus } from "@/common/constants/task-status";

export type TasksReadDto = {
  id: string;
  object_id: string | null;
  title: string;
  description: string;
  assignee_id: string | null;
  status: TaskStatus;
  author_id: string;
  created_at: string;
  updated_at: string;
  objects?: { id: string; name: string; address: string } | null;
  assignee?: { id: string; full_name: string; email: string } | null;
  author?: { id: string; full_name: string; email: string } | null;
};

export type TaskStatusHistoryReadDto = {
  id: string;
  task_id: string;
  from_status: TaskStatus | null;
  to_status: TaskStatus;
  changed_by: string;
  comment: string | null;
  created_at: string;
  changer?: { id: string; full_name: string; email: string } | null;
};

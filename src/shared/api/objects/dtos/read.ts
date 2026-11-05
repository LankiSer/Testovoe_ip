export type ObjectsReadDto = {
  id: string;
  name: string;
  address: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  tasks_count?: number;
  open_tasks_count?: number;
};

import { createClient } from "@/shared/api/supabase/server";
import type {
  TaskStatusHistoryReadDto,
  TasksReadDto,
} from "@/shared/api/tasks/dtos/read";

export class TasksReadService {
  static async index(input?: {
    id?: string;
    objectId?: string;
    mine?: boolean;
  }): Promise<TasksReadDto | TasksReadDto[] | null> {
    const supabase = await createClient();
    const select =
      "*, objects:object_id(id, name, address), assignee:assignee_id(id, full_name, email), author:author_id(id, full_name, email)";

    if (input?.id) {
      const { data, error } = await supabase
        .from("tasks")
        .select(select)
        .eq("id", input.id)
        .maybeSingle();
      if (error) throw error;
      return data as TasksReadDto | null;
    }

    let query = supabase.from("tasks").select(select).order("created_at", {
      ascending: false,
    });

    if (input?.objectId) {
      query = query.eq("object_id", input.objectId);
    }

    if (input?.mine) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      query = query.eq("assignee_id", user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as TasksReadDto[];
  }
}

export class TaskStatusHistoryReadService {
  static async index(taskId: string): Promise<TaskStatusHistoryReadDto[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("task_status_history")
      .select(
        "*, changer:changed_by(id, full_name, email)",
      )
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as TaskStatusHistoryReadDto[];
  }
}

import { createClient } from "@/shared/api/supabase/server";
import type { ObjectsReadDto } from "@/shared/api/objects/dtos/read";

export class ObjectsReadService {
  static async index(id?: string): Promise<ObjectsReadDto | ObjectsReadDto[] | null> {
    const supabase = await createClient();

    if (id) {
      const { data, error } = await supabase
        .from("objects")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as ObjectsReadDto | null;
    }

    const { data, error } = await supabase
      .from("objects")
      .select("*, tasks(id, status)")
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data ?? []).map((row) => {
      const tasks = (row.tasks as { id: string; status: string }[] | null) ?? [];
      const { tasks: _tasks, ...object } = row as ObjectsReadDto & {
        tasks: { id: string; status: string }[];
      };
      return {
        ...object,
        tasks_count: tasks.length,
        open_tasks_count: tasks.filter((task) => task.status !== "accepted")
          .length,
      };
    }) as ObjectsReadDto[];
  }
}

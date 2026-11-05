import { createClient } from "@/shared/api/supabase/server";
import type { ProfilesReadDto } from "@/shared/api/profiles/dtos/read";

export class ProfilesReadService {
  static async index(id?: string): Promise<ProfilesReadDto | ProfilesReadDto[] | null> {
    const supabase = await createClient();

    if (id) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as ProfilesReadDto | null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");
    if (error) throw error;
    return data as ProfilesReadDto[];
  }
}

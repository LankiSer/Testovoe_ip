import { createClient } from "@/shared/api/supabase/server";
import type { ProfilesReadDto } from "@/shared/api/profiles/dtos/read";

export class ProfilesMeService {
  static async index(): Promise<ProfilesReadDto | null> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    return data as ProfilesReadDto | null;
  }
}

import type { UserRole } from "@/common/constants/user-role";

export type ProfilesReadDto = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

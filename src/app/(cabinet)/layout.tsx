import { redirect } from "next/navigation";
import { CabinetShell } from "@/components/layout/cabinet-shell/component";
import { ProfilesMeService } from "@/shared/api/profiles/services/me";

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await ProfilesMeService.index();
  if (!profile) redirect("/login");

  return <CabinetShell profile={profile}>{children}</CabinetShell>;
}

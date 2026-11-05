import { ObjectList } from "@/components/display/object/list/component";
import { ObjectsReadService } from "@/shared/api/objects/services/read";
import { ProfilesMeService } from "@/shared/api/profiles/services/me";
import type { ObjectsReadDto } from "@/shared/api/objects/dtos/read";

export default async function ObjectsPage() {
  const profile = await ProfilesMeService.index();
  const objects = (await ObjectsReadService.index()) as ObjectsReadDto[];

  return (
    <ObjectList
      objects={objects}
      canManage={profile?.role === "manager"}
    />
  );
}

import { Group, Stack, Text, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import { ObjectManagerToolbar } from "@/components/actions/object/manager-toolbar/component";
import { TaskCreateButton } from "@/components/actions/task/create-button/component";
import { TextLink } from "@/components/actions/link/text/component";
import { TaskKanban } from "@/components/display/task/kanban/component";
import { ObjectsReadService } from "@/shared/api/objects/services/read";
import { ProfilesMeService } from "@/shared/api/profiles/services/me";
import { ProfilesReadService } from "@/shared/api/profiles/services/read";
import { TasksReadService } from "@/shared/api/tasks/services/read";
import type { ObjectsReadDto } from "@/shared/api/objects/dtos/read";
import type { ProfilesReadDto } from "@/shared/api/profiles/dtos/read";
import type { TasksReadDto } from "@/shared/api/tasks/dtos/read";

export default async function ObjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await ProfilesMeService.index();
  if (!profile) notFound();

  const object = (await ObjectsReadService.index(id)) as ObjectsReadDto | null;
  if (!object) notFound();

  const tasks = (await TasksReadService.index({
    objectId: id,
  })) as TasksReadDto[];

  const profiles =
    profile.role === "manager"
      ? ((await ProfilesReadService.index()) as ProfilesReadDto[])
      : [];
  const assignees = profiles.map((p) => ({
    value: p.id,
    label: `${p.full_name || p.email}${p.role === "manager" ? " · постановщик" : ""}`,
  }));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed" mb={4}>
            <TextLink href="/objects">← Все объекты</TextLink>
          </Text>
          <Title order={2}>{object.name}</Title>
          <Text c="dimmed">{object.address}</Text>
          <Text size="sm" c="dimmed" mt={6}>
            Доска задач только этого объекта · {tasks.length}
          </Text>
        </div>
        <Group>
          {profile.role === "manager" ? (
            <>
              <TaskCreateButton objectId={object.id} assignees={assignees} />
              <ObjectManagerToolbar object={object} />
            </>
          ) : null}
        </Group>
      </Group>

      <TaskKanban
        tasks={tasks}
        role={profile.role}
        userId={profile.id}
        showObject={false}
        emptyHint="У объекта пока нет задач"
      />
    </Stack>
  );
}

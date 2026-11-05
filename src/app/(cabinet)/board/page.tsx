import { Alert, Group, Stack, Text, Title } from "@mantine/core";
import { TaskCreateButton } from "@/components/actions/task/create-button/component";
import { TaskKanban } from "@/components/display/task/kanban/component";
import { ObjectsReadService } from "@/shared/api/objects/services/read";
import { ProfilesMeService } from "@/shared/api/profiles/services/me";
import { ProfilesReadService } from "@/shared/api/profiles/services/read";
import { TasksReadService } from "@/shared/api/tasks/services/read";
import type { ObjectsReadDto } from "@/shared/api/objects/dtos/read";
import type { ProfilesReadDto } from "@/shared/api/profiles/dtos/read";
import type { TasksReadDto } from "@/shared/api/tasks/dtos/read";

export default async function BoardPage() {
  const profile = await ProfilesMeService.index();
  if (!profile) return null;

  const tasks = (await TasksReadService.index()) as TasksReadDto[];
  const objects = (await ObjectsReadService.index()) as ObjectsReadDto[];
  const withoutObject = tasks.filter((task) => !task.object_id).length;

  const profiles =
    profile.role === "manager"
      ? ((await ProfilesReadService.index()) as ProfilesReadDto[])
      : [];
  const assignees = profiles.map((p) => ({
    value: p.id,
    label: `${p.full_name || p.email}${p.role === "manager" ? " · постановщик" : ""}`,
  }));
  const objectOptions = objects.map((object) => ({
    value: object.id,
    label: object.name,
  }));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2}>Общая доска</Title>
          <Text c="dimmed" size="sm">
            Все доступные вам задачи по объектам и без объекта
          </Text>
        </div>
        {profile.role === "manager" ? (
          <TaskCreateButton objects={objectOptions} assignees={assignees} />
        ) : null}
      </Group>

      <Group gap="md">
        <Text size="sm">
          Всего: <b>{tasks.length}</b>
        </Text>
        <Text size="sm" c="dimmed">
          Без объекта: {withoutObject}
        </Text>
      </Group>

      {profile.role === "manager" ? (
        <Alert color="blue" variant="light" title="Как пользоваться">
          Перетаскивайте задачи между столбцами по правилам статусов. Для возврата
          на доработку потребуется комментарий. Задачу можно создать без объекта —
          например, личные поручения постановщика.
        </Alert>
      ) : null}

      <TaskKanban
        tasks={tasks}
        role={profile.role}
        userId={profile.id}
        showObject
        emptyHint="Пока нет задач на общей доске"
      />
    </Stack>
  );
}

import { Alert, Group, Stack, Text, Title } from "@mantine/core";
import { TaskKanban } from "@/components/display/task/kanban/component";
import { ProfilesMeService } from "@/shared/api/profiles/services/me";
import { TasksReadService } from "@/shared/api/tasks/services/read";
import type { TasksReadDto } from "@/shared/api/tasks/dtos/read";

export default async function MyTasksPage() {
  const profile = await ProfilesMeService.index();
  if (!profile) return null;

  const tasks = (await TasksReadService.index({ mine: true })) as TasksReadDto[];

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2}>Мои задачи</Title>
          <Text c="dimmed" size="sm">
            Только то, что назначено лично вам — в том числе без объекта
          </Text>
        </div>
      </Group>

      <Alert color="gray" variant="light">
        Здесь фильтр по исполнителю = вы. Общая доска показывает все доступные
        задачи команды.
      </Alert>

      <TaskKanban
        tasks={tasks}
        role={profile.role}
        userId={profile.id}
        showObject
        emptyHint="На вас пока ничего не назначено"
      />
    </Stack>
  );
}

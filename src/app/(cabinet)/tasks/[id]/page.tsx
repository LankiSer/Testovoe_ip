import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import { TextLink } from "@/components/actions/link/text/component";
import { TaskTransitionsActions } from "@/components/actions/task/transitions/component";
import { TaskManagerToolbar } from "@/components/actions/task/manager-toolbar/component";
import { TaskHistoryList } from "@/components/display/task/history/component";
import { TaskStatusBadge } from "@/components/display/task/status-badge/component";
import { DateFormatUtility } from "@/common/formatters/date/format";
import { ObjectsReadService } from "@/shared/api/objects/services/read";
import { ProfilesMeService } from "@/shared/api/profiles/services/me";
import { ProfilesReadService } from "@/shared/api/profiles/services/read";
import {
  TaskStatusHistoryReadService,
  TasksReadService,
} from "@/shared/api/tasks/services/read";
import type { ObjectsReadDto } from "@/shared/api/objects/dtos/read";
import type { ProfilesReadDto } from "@/shared/api/profiles/dtos/read";
import type { TasksReadDto } from "@/shared/api/tasks/dtos/read";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await ProfilesMeService.index();
  if (!profile) notFound();

  const task = (await TasksReadService.index({ id })) as TasksReadDto | null;
  if (!task) notFound();

  const history = await TaskStatusHistoryReadService.index(id);

  const profiles =
    profile.role === "manager"
      ? ((await ProfilesReadService.index()) as ProfilesReadDto[])
      : [];
  const assignees = profiles.map((p) => ({
    value: p.id,
    label: `${p.full_name || p.email}${p.role === "manager" ? " · постановщик" : ""}`,
  }));
  const objects =
    profile.role === "manager"
      ? ((await ObjectsReadService.index()) as ObjectsReadDto[])
      : [];
  const objectOptions = objects.map((object) => ({
    value: object.id,
    label: object.name,
  }));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed" mb={6}>
            {task.object_id ? (
              <TextLink href={`/objects/${task.object_id}`}>
                ← {task.objects?.name ?? "Объект"}
              </TextLink>
            ) : (
              <TextLink href="/board">← Общая доска</TextLink>
            )}
          </Text>
          <Title order={2} style={{ letterSpacing: "-0.02em" }}>
            {task.title}
          </Title>
          <Group mt="sm" gap="sm">
            <TaskStatusBadge status={task.status} />
            <Text size="sm" c="dimmed">
              {task.objects?.name ?? "Без объекта"}
            </Text>
            <Text size="sm" c="dimmed">
              · {DateFormatUtility.index(task.created_at)}
            </Text>
          </Group>
        </div>
        {profile.role === "manager" ? (
          <TaskManagerToolbar
            objectId={task.object_id ?? undefined}
            objects={objectOptions}
            assignees={assignees}
            task={{
              id: task.id,
              title: task.title,
              description: task.description,
              assignee_id: task.assignee_id,
              object_id: task.object_id,
            }}
          />
        ) : null}
      </Group>

      <Paper withBorder p="lg" radius="md" style={{ background: "#fff" }}>
        <Stack gap="md">
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
              Описание
            </Text>
            <Text style={{ whiteSpace: "pre-wrap" }}>
              {task.description || "Без описания"}
            </Text>
          </div>
          <Group grow>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                Исполнитель
              </Text>
              <Text size="sm">
                {task.assignee?.full_name ||
                  task.assignee?.email ||
                  "Не назначен"}
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                Автор
              </Text>
              <Text size="sm">
                {task.author?.full_name || task.author?.email || "—"}
              </Text>
            </div>
          </Group>
        </Stack>
      </Paper>

      <Paper withBorder p="lg" radius="md" style={{ background: "#fff" }}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="sm">
          Доступные действия
        </Text>
        <TaskTransitionsActions
          taskId={task.id}
          status={task.status}
          role={profile.role}
          assigneeId={task.assignee_id}
          userId={profile.id}
        />
      </Paper>

      <Paper withBorder p="lg" radius="md" style={{ background: "#fff" }}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="md">
          История изменений
        </Text>
        <TaskHistoryList items={history} />
      </Paper>
    </Stack>
  );
}

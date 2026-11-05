"use client";

import { Button, Group, Stack, Textarea } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TaskTransitionsAvailableUtility } from "@/common/task-transitions/available";
import type { TaskStatus } from "@/common/constants/task-status";
import type { UserRole } from "@/common/constants/user-role";
import { createClient } from "@/shared/api/supabase/client";

export function TaskTransitionsActions({
  taskId,
  status,
  role,
  assigneeId,
  userId,
}: {
  taskId: string;
  status: TaskStatus;
  role: UserRole;
  assigneeId: string | null;
  userId: string;
}) {
  const router = useRouter();
  const [loadingTo, setLoadingTo] = useState<string | null>(null);
  const actions = TaskTransitionsAvailableUtility.index({
    status,
    role,
    assigneeId,
    userId,
  });

  if (actions.length === 0) return null;

  async function runTransition(to: TaskStatus, comment?: string) {
    setLoadingTo(to);
    const supabase = createClient();
    const { error } = await supabase.rpc("transition_task", {
      p_task_id: taskId,
      p_to_status: to,
      p_comment: comment ?? null,
    });
    setLoadingTo(null);

    if (error) {
      notifications.show({
        color: "red",
        title: "Переход запрещён",
        message: error.message,
      });
      return;
    }

    notifications.show({ color: "teal", message: "Статус обновлён" });
    router.refresh();
  }

  function onAction(action: (typeof actions)[number]) {
    if (!action.needsComment) {
      void runTransition(action.to);
      return;
    }

    let comment = "";
    modals.open({
      title: "Комментарий к доработке",
      children: (
        <Stack>
          <Textarea
            label="Что исправить"
            required
            minRows={3}
            onChange={(e) => {
              comment = e.currentTarget.value;
            }}
          />
          <Button
            onClick={() => {
              if (!comment.trim()) {
                notifications.show({
                  color: "red",
                  message: "Комментарий обязателен",
                });
                return;
              }
              modals.closeAll();
              void runTransition(action.to, comment.trim());
            }}
          >
            Отправить на доработку
          </Button>
        </Stack>
      ),
    });
  }

  return (
    <Group>
      {actions.map((action) => (
        <Button
          key={action.to}
          variant={action.needsComment ? "outline" : "filled"}
          color={action.needsComment ? "orange" : "teal"}
          loading={loadingTo === action.to}
          onClick={() => onAction(action)}
        >
          {action.label}
        </Button>
      ))}
    </Group>
  );
}

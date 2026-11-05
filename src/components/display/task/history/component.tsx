"use client";

import { Stack, Text, Timeline, TimelineItem } from "@mantine/core";
import { DateFormatUtility } from "@/common/formatters/date/format";
import {
  TaskStatusLabelConstant,
  type TaskStatus,
} from "@/common/constants/task-status";
import type { TaskStatusHistoryReadDto } from "@/shared/api/tasks/dtos/read";

function historyTitle(from: TaskStatus | null, to: TaskStatus) {
  if (!from) {
    return `Создана · ${TaskStatusLabelConstant[to]}`;
  }
  return `${TaskStatusLabelConstant[from]} → ${TaskStatusLabelConstant[to]}`;
}

export function TaskHistoryList({
  items,
}: {
  items: TaskStatusHistoryReadDto[];
}) {
  if (items.length === 0) {
    return <Text c="dimmed">История пуста</Text>;
  }

  return (
    <Timeline active={items.length - 1} bulletSize={18} lineWidth={2}>
      {items.map((item) => (
        <TimelineItem
          key={item.id}
          title={historyTitle(item.from_status, item.to_status)}
        >
          <Stack gap={2}>
            <Text size="sm">
              {item.changer?.full_name || item.changer?.email || "Пользователь"}
            </Text>
            <Text size="xs" c="dimmed">
              {DateFormatUtility.index(item.created_at)}
            </Text>
            {item.comment ? (
              <Text size="sm" mt={4}>
                Комментарий: {item.comment}
              </Text>
            ) : null}
          </Stack>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

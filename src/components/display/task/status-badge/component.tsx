"use client";

import { Badge } from "@mantine/core";
import {
  TaskStatusColorConstant,
  TaskStatusLabelConstant,
  type TaskStatus,
} from "@/common/constants/task-status";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge color={TaskStatusColorConstant[status]} variant="light">
      {TaskStatusLabelConstant[status]}
    </Badge>
  );
}

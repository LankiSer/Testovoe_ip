import type { TaskStatus } from "@/common/constants/task-status";
import { TaskStatusLabelConstant } from "@/common/constants/task-status";

export const TaskBoardColumnsConstant: {
  status: TaskStatus;
  label: string;
  accent: string;
}[] = [
  { status: "new", label: TaskStatusLabelConstant.new, accent: "#64748b" },
  {
    status: "in_progress",
    label: TaskStatusLabelConstant.in_progress,
    accent: "#0284c7",
  },
  { status: "review", label: TaskStatusLabelConstant.review, accent: "#d97706" },
  { status: "rework", label: TaskStatusLabelConstant.rework, accent: "#ea580c" },
  {
    status: "accepted",
    label: TaskStatusLabelConstant.accepted,
    accent: "#16a34a",
  },
];

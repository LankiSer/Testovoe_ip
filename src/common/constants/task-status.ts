export const TaskStatusConstant = {
  new: "new",
  in_progress: "in_progress",
  review: "review",
  accepted: "accepted",
  rework: "rework",
} as const;

export type TaskStatus =
  (typeof TaskStatusConstant)[keyof typeof TaskStatusConstant];

export const TaskStatusLabelConstant: Record<TaskStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  review: "На проверке",
  accepted: "Принята",
  rework: "На доработке",
};

export const TaskStatusColorConstant: Record<
  TaskStatus,
  "gray" | "blue" | "yellow" | "green" | "orange"
> = {
  new: "gray",
  in_progress: "blue",
  review: "yellow",
  accepted: "green",
  rework: "orange",
};

import type { TaskStatus } from "@/common/constants/task-status";
import type { UserRole } from "@/common/constants/user-role";

export type TaskTransitionAction = {
  to: TaskStatus;
  label: string;
  needsComment?: boolean;
};

export class TaskTransitionsAvailableUtility {
  static index(input: {
    status: TaskStatus;
    role: UserRole;
    assigneeId: string | null;
    userId: string;
  }): TaskTransitionAction[] {
    const { status, role, assigneeId, userId } = input;
    const isAssignee = assigneeId === userId;
    const actions: TaskTransitionAction[] = [];

    if (isAssignee) {
      if (status === "new") {
        actions.push({ to: "in_progress", label: "Взять в работу" });
      }
      if (status === "in_progress") {
        actions.push({ to: "review", label: "Отправить на проверку" });
      }
      if (status === "rework") {
        actions.push({ to: "in_progress", label: "Вернуться в работу" });
      }
    }

    if (role === "manager" && status === "review") {
      actions.push(
        { to: "accepted", label: "Принять" },
        { to: "rework", label: "На доработку", needsComment: true },
      );
    }

    return actions;
  }

  static canMoveTo(input: {
    status: TaskStatus;
    role: UserRole;
    assigneeId: string | null;
    userId: string;
    to: TaskStatus;
  }): boolean {
    return this.index(input).some((action) => action.to === input.to);
  }

  static needsComment(input: {
    status: TaskStatus;
    role: UserRole;
    assigneeId: string | null;
    userId: string;
    to: TaskStatus;
  }): boolean {
    return (
      this.index(input).find((action) => action.to === input.to)?.needsComment ===
      true
    );
  }
}

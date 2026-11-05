export const UserRoleConstant = {
  manager: "manager",
  executor: "executor",
} as const;

export type UserRole = (typeof UserRoleConstant)[keyof typeof UserRoleConstant];

export const UserRoleLabelConstant: Record<UserRole, string> = {
  manager: "Постановщик",
  executor: "Исполнитель",
};

import { type UserRole } from "@/constants/roles";

export * from "@/constants/roles";

export function canAccessRole(
  role: string | null | undefined,
  allowedRoles: Array<UserRole | string>
) {
  if (!role) return false;
  return allowedRoles.includes(role);
}
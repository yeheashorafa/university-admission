import { adminRoles } from "@/constants/roles";
import { RoleGuard } from "./role-guard";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  return <RoleGuard allowedRoles={adminRoles}>{children}</RoleGuard>;
}
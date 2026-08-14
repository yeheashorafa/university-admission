import { RoleGuard } from "./role-guard";

type StudentGuardProps = {
  children: React.ReactNode;
};

export function StudentGuard({ children }: StudentGuardProps) {
  return <RoleGuard allowedRoles={["student"]}>{children}</RoleGuard>;
}
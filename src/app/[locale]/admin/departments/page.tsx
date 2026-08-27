import { DepartmentsPage } from "@/features/admin/departments/page";
import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <DepartmentsPage />
    </RoleGuard>
  );
}

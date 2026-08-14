import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminUsersPage } from "@/features/admin/users/page";

export default function Page() {
  return (
    <RoleGuard
      allowedRoles={[
        userRoles.admin,
        userRoles.admissionDean,
        userRoles.departmentHead,
      ]}
    >
      <AdminUsersPage />
    </RoleGuard>
  );
}
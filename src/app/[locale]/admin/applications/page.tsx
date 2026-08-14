import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminApplicationsPage } from "@/features/admin/applications/page";

export default function Page() {
  return (
    <RoleGuard
      allowedRoles={[
        userRoles.admin,
        userRoles.departmentHead,
        userRoles.admissionEmployee,
      ]}
    >
      <AdminApplicationsPage />
    </RoleGuard>
  );
}
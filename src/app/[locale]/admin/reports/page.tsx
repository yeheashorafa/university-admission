import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminReportsPage } from "@/features/admin/reports/page";

export default function Page() {
  return (
    <RoleGuard
      allowedRoles={[
        userRoles.admin,
        userRoles.admissionDean,
      ]}
    >
      <AdminReportsPage />
    </RoleGuard>
  );
}
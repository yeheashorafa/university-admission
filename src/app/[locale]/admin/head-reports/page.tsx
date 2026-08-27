import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { HeadReportsPage } from "@/features/admin/head-reports/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.departmentHead]}>
      <HeadReportsPage />
    </RoleGuard>
  );
}

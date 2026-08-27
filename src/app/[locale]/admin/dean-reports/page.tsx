import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { DeanReportsPage } from "@/features/admin/dean-reports/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admissionDean]}>
      <DeanReportsPage />
    </RoleGuard>
  );
}

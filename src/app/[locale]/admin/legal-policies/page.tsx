import { AdminLegalPoliciesPage } from "@/features/admin/legal-policies/page";
import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin, userRoles.admissionDean]}>
      <AdminLegalPoliciesPage />
    </RoleGuard>
  );
}
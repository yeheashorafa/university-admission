import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminManualReviewPage } from "@/features/admin/manual-review/page";

export default function Page() {
  return (
    <RoleGuard
      allowedRoles={[
        userRoles.admin,
        userRoles.departmentHead,
        userRoles.admissionEmployee,
      ]}
    >
      <AdminManualReviewPage />
    </RoleGuard>
  );
}
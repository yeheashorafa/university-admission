import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminSecondarySchoolRecordsPage } from "@/features/admin/secondary-school-records/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <AdminSecondarySchoolRecordsPage />
    </RoleGuard>
  );
}

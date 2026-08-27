import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { HeadNotificationsPage } from "@/features/admin/head-notifications/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.departmentHead]}>
      <HeadNotificationsPage />
    </RoleGuard>
  );
}

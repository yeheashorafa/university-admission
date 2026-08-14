import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminNotificationsPage } from "@/features/admin/notifications/page";

export default function Page() {
  return (
    <RoleGuard
      allowedRoles={[
        userRoles.admin,
        userRoles.admissionDean,
        userRoles.departmentHead,
        userRoles.admissionEmployee,
      ]}
    >
      <AdminNotificationsPage />
    </RoleGuard>
  );
}
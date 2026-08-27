import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { EmployeeNotificationsPage } from "@/features/admin/employee-notifications/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admissionEmployee]}>
      <EmployeeNotificationsPage />
    </RoleGuard>
  );
}

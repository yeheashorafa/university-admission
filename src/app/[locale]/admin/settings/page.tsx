import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminSettingsPage } from "@/features/admin/settings/page";

export default function Page() {
  return (
    <RoleGuard
      allowedRoles={[
        userRoles.admin,
        userRoles.admissionDean,
      ]}
    >
      <AdminSettingsPage />
    </RoleGuard>
  );
}
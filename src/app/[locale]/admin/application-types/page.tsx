import { ApplicationTypesPage } from "@/features/admin/application-types/page";
import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <ApplicationTypesPage />
    </RoleGuard>
  );
}

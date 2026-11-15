import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminProgramFormPage } from "@/features/admin/programs/form-page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <AdminProgramFormPage mode="create" />
    </RoleGuard>
  );
}

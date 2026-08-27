import { FacultiesPage } from "@/features/admin/faculties/page";
import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <FacultiesPage />
    </RoleGuard>
  );
}

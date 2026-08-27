import { DocumentTypesPage } from "@/features/admin/document-types/page";
import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <DocumentTypesPage />
    </RoleGuard>
  );
}

import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminDocumentVerificationPage } from "@/features/admin/document-verification/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admissionEmployee]}>
      <AdminDocumentVerificationPage />
    </RoleGuard>
  );
}
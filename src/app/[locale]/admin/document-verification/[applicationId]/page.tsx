import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminDocumentVerificationPage } from "@/features/admin/document-verification/page";

type PageProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { applicationId } = await params;

  return (
    <RoleGuard allowedRoles={[userRoles.admissionEmployee]}>
      <AdminDocumentVerificationPage applicationId={applicationId} />
    </RoleGuard>
  );
}
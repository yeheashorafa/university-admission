import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminApplicationDetailsPage } from "@/features/admin/application-details/page";

type PageProps = {
  params: Promise<{
    applicationId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { applicationId } = await params;

  return (
    <RoleGuard
      allowedRoles={[
        userRoles.admin,
        userRoles.departmentHead,
        userRoles.admissionEmployee,
      ]}
    >
      <AdminApplicationDetailsPage applicationId={applicationId} />
    </RoleGuard>
  );
}
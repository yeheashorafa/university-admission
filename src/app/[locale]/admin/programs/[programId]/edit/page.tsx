import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AdminProgramFormPage } from "@/features/admin/programs/form-page";

export default async function Page({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <AdminProgramFormPage mode="edit" programId={programId} />
    </RoleGuard>
  );
}

import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { StatusPage } from "@/features/status/page";

type Props = {
  params: Promise<{ applicationId: string }>;
};

export default async function Page({ params }: Props) {
  const resolvedParams = await params;

  return (
    <RoleGuard allowedRoles={[userRoles.student]}>
      <StatusPage applicationId={resolvedParams.applicationId} />
    </RoleGuard>
  );
}

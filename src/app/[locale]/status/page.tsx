import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { StatusPage } from "@/features/status/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.student]}>
      <StatusPage />
    </RoleGuard>
  );
}
import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { AiProvidersPage } from "@/features/admin/ai-providers/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.admin]}>
      <AiProvidersPage />
    </RoleGuard>
  );
}

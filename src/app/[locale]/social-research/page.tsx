import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { SocialResearchPage } from "@/features/social-research/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.student]}>
      <SocialResearchPage />
    </RoleGuard>
  );
}
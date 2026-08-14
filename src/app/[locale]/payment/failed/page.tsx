import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { PaymentFailedPage } from "@/features/payment/failed/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.student]}>
      <PaymentFailedPage />
    </RoleGuard>
  );
}
import { RoleGuard } from "@/components/auth/role-guard";
import { userRoles } from "@/constants/roles";
import { PaymentSuccessPage } from "@/features/payment/success/page";

export default function Page() {
  return (
    <RoleGuard allowedRoles={[userRoles.student]}>
      <PaymentSuccessPage />
    </RoleGuard>
  );
}
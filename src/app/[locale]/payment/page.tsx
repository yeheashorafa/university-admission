import { StudentGuard } from "@/components/auth/student-guard";
import { StudentPaymentPage } from "@/features/payment/page";

export default function Page() {
  return (
    <StudentGuard>
      <StudentPaymentPage />
    </StudentGuard>
  );
}
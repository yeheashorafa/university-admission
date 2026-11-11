import { notFound } from "next/navigation";
import { paymentsEnabled } from "@/constants/features";
import { StudentGuard } from "@/components/auth/student-guard";
import { StudentPaymentPage } from "@/features/payment/page";

export default function Page() {
  if (!paymentsEnabled) notFound();

  return (
    <StudentGuard>
      <StudentPaymentPage />
    </StudentGuard>
  );
}
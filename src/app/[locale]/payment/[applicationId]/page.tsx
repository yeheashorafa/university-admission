import { notFound } from "next/navigation";
import { paymentsEnabled } from "@/constants/features";
import { StudentGuard } from "@/components/auth/student-guard";
import { StudentPaymentPage } from "@/features/payment/page";

type Props = {
  params: Promise<{ applicationId: string }>;
};

export default async function Page({ params }: Props) {
  if (!paymentsEnabled) notFound();

  const resolvedParams = await params;

  return (
    <StudentGuard>
      <StudentPaymentPage applicationId={resolvedParams.applicationId} />
    </StudentGuard>
  );
}

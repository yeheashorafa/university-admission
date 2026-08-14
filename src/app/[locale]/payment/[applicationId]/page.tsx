import { StudentGuard } from "@/components/auth/student-guard";
import { StudentPaymentPage } from "@/features/payment/page";

type Props = {
  params: Promise<{ applicationId: string }>;
};

export default async function Page({ params }: Props) {
  const resolvedParams = await params;

  return (
    <StudentGuard>
      <StudentPaymentPage applicationId={resolvedParams.applicationId} />
    </StudentGuard>
  );
}

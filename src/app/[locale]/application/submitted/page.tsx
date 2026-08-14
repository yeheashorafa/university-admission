import { StudentGuard } from "@/components/auth/student-guard";
import { ApplicationSubmittedPage } from "@/features/application-submitted/page";

export default function Page() {
  return (
    <StudentGuard>
      <ApplicationSubmittedPage />
    </StudentGuard>
  );
}
import { StudentGuard } from "@/components/auth/student-guard";
import { ApplicationPage } from "@/features/application/page";

export default function Page() {
  return (
    <StudentGuard>
      <ApplicationPage />
    </StudentGuard>
  );
}
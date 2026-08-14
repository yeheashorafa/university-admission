import { StudentGuard } from "@/components/auth/student-guard";
import { StudentApplicationsPage } from "@/features/applications/page";

export default function Page() {
  return (
    <StudentGuard>
      <StudentApplicationsPage />
    </StudentGuard>
  );
}

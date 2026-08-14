import { StudentGuard } from "@/components/auth/student-guard";
import { StudentDashboardPage } from "@/features/student/dashboard/page";

export default function Page() {
  return (
    <StudentGuard>
      <StudentDashboardPage />
    </StudentGuard>
  );
}
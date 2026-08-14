import { StudentGuard } from "@/components/auth/student-guard";
import { StudentNotificationsPage } from "@/features/notifications/page";

export default function Page() {
  return (
    <StudentGuard>
      <StudentNotificationsPage />
    </StudentGuard>
  );
}
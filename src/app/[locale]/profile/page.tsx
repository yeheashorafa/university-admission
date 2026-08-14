import { StudentGuard } from "@/components/auth/student-guard";
import { StudentProfilePage } from "@/features/profile/page";

export default function Page() {
  return (
    <StudentGuard>
      <StudentProfilePage />
    </StudentGuard>
  );
}
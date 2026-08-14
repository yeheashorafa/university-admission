import { StudentGuard } from "@/components/auth/student-guard";
import { DocumentsPage } from "@/features/documents/page";

export default function Page() {
  return (
    <StudentGuard>
      <DocumentsPage />
    </StudentGuard>
  );
}
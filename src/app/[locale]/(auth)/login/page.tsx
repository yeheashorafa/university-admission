import { LoginPage } from "@/features/auth/login/page";
import { AuthPageGuard } from "@/components/auth/auth-page-guard";

export default function Page() {
  return (
    <AuthPageGuard>
      <LoginPage />
    </AuthPageGuard>
  );
}
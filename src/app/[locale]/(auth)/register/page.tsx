import { RegisterPage } from "@/features/auth/register/page";
import { AuthPageGuard } from "@/components/auth/auth-page-guard";

export default function Page() {
  return (
    <AuthPageGuard>
      <RegisterPage />
    </AuthPageGuard>
  );
}
import { LoginVisual } from "@/features/auth/login/components/login-visual";
import { ResetPasswordForm } from "./components/reset-password-form";

export function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <ResetPasswordForm />
      <LoginVisual />
    </div>
  );
}
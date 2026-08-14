import { ForgotPasswordForm } from "./components/forgot-password-form";
import { LoginVisual } from "@/features/auth/login/components/login-visual";

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <ForgotPasswordForm />
      <LoginVisual />
    </div>
  );
}
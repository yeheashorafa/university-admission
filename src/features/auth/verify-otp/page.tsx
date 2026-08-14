import { VerifyOtpForm } from "./components/verify-otp-form";

export function VerifyOtpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <VerifyOtpForm />
    </main>
  );
}
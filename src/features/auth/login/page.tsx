import { PortalFooter } from "@/components/layouts/portal-footer";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { routes } from "@/constants/routes";
import { LoginForm } from "./components/login-form";
import { LoginVisual } from "./components/login-visual";

export function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.login} />

      <main className="app-container flex flex-1 items-center py-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <LoginVisual />
          <LoginForm />
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
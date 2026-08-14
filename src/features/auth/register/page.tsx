import { PortalFooter } from "@/components/layouts/portal-footer";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { routes } from "@/constants/routes";
import { RegisterForm } from "./components/register-form";
import { RegisterVisual } from "./components/register-visual";

export function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.register} />

      <main className="app-container flex flex-1 items-center py-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <RegisterForm />
          <RegisterVisual />
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
import { UnauthorizedHero } from "./components/unauthorized-hero";
import { PortalNavbar } from "../../components/layouts/portal-navbar";
import { PortalFooter } from "../../components/layouts/portal-footer";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath="" />

      <main className="app-container flex flex-1 items-center justify-center py-16">
        <UnauthorizedHero />
      </main>

      <PortalFooter />
    </div>
  );
}
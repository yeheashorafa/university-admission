
import { PortalFooter } from "../../components/layouts/portal-footer";
import { PortalNavbar } from "../../components/layouts/portal-navbar";
import { NotFoundHero } from "./components/not-found-hero";

export function LocalizedNotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath="" />

      <main className="app-container flex flex-1 items-center justify-center py-16">
        <NotFoundHero />
      </main>

      <PortalFooter />
    </div>
  );
}
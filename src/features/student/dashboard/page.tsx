import { routes } from "@/constants/routes";
import { DashboardWelcome } from "./components/dashboard-welcome";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { PortalFooter } from "@/components/layouts/portal-footer";
import { ProfileCompletionCard } from "./components/profile-completion-card";
import { CurrentApplicationCard } from "./components/current-application-card";
import { QuickActions } from "./components/quick-actions";
import { AdmissionTimeline } from "./components/admission-timeline";
import { NotificationsCard } from "./components/notifications-card";

export function StudentDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.dashboard} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        <DashboardWelcome />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section className="flex flex-col gap-6 lg:col-span-8">
            <ProfileCompletionCard />
            <CurrentApplicationCard />
            <QuickActions />
          </section>

          <aside className="flex flex-col gap-6 lg:col-span-4">
            <AdmissionTimeline />
            <NotificationsCard />
          </aside>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}

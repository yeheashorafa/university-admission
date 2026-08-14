import { routes } from "@/constants/routes";
import { NotificationsHeader } from "./components/notifications-header";

import { PortalNavbar } from "../../components/layouts/portal-navbar";
import { PortalFooter } from "../../components/layouts/portal-footer";
import { NotificationsStats } from "./components/notifications-stats";
import { NotificationsToolbar } from "./components/notifications-toolbar";
import { NotificationsList } from "./components/notifications-list";

export function StudentNotificationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.notifications} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        <NotificationsHeader />
        <NotificationsStats />
        <NotificationsToolbar />
        <NotificationsList />
      </main>

      <PortalFooter />
    </div>
  );
}
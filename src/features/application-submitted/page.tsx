
import { routes } from "@/constants/routes";
import { ApplicationSubmittedHero } from "./components/application-submitted-hero";
import {  PortalNavbar } from "../../components/layouts/portal-navbar";
import {  PortalFooter } from "../../components/layouts/portal-footer";
import { SubmittedApplicationSummary } from "./components/submitted-application-summary";
import { SubmittedNextSteps } from "./components/submitted-next-steps";
import { SubmittedActionsCard } from "./components/submitted-actions-card";

export function ApplicationSubmittedPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.application} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        <ApplicationSubmittedHero />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="flex flex-col gap-6 xl:col-span-8">
            <SubmittedApplicationSummary />
            <SubmittedNextSteps />
          </section>

          <aside className="xl:col-span-4">
            <SubmittedActionsCard />
          </aside>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
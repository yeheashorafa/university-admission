import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { PortalFooter } from "@/components/layouts/portal-footer";
import { routes } from "@/constants/routes";

import { LandingPortalHero } from "./components/landing-portal-hero";
import { QuickServices } from "./components/quick-services";
import { LandingFacultiesPreview } from "./components/landing-faculties-preview";
import { LandingAdmissionWorkflow } from "./components/landing-admission-workflow";
import { LandingAiVerificationPreview } from "./components/landing-ai-verification-preview";
import { LandingPaymentSocialSection } from "./components/landing-payment-social-section";
import { LandingFinalCta } from "./components/landing-final-cta";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNavbar activePath={routes.home} />

      <main className="app-container space-y-12 py-8 md:space-y-16">
        <LandingPortalHero />
        <QuickServices />
        {/* <LandingApplicationsPreview /> */}
        <LandingFacultiesPreview />
        <LandingAdmissionWorkflow />
        <LandingAiVerificationPreview />
        <LandingPaymentSocialSection />
        <LandingFinalCta />
      </main>

      <PortalFooter />
    </div>
  );
}

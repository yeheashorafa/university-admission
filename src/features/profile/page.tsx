
import { routes } from "@/constants/routes";
import { ProfileHeader } from "./components/profile-header";
import { PortalNavbar } from "../../components/layouts/portal-navbar";
import { ProfileCompletionCard } from "./components/profile-completion-card";
import { AcademicSummaryCard } from "./components/academic-summary-card";
import { AccountSecurityCard } from "./components/account-security-card";
import { PersonalInformationForm } from "./components/personal-information-form";
import { ContactInformationForm } from "./components/contact-information-form";
import { SecondarySchoolRecordForm } from "./components/secondary-school-record-form";
import { PortalFooter } from "../../components/layouts/portal-footer";

export function StudentProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.profile} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        <ProfileHeader />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <aside className="flex flex-col gap-6 xl:col-span-4">
            <ProfileCompletionCard />
            <AcademicSummaryCard />
            <AccountSecurityCard />
          </aside>

          <section className="flex flex-col gap-6 xl:col-span-8">
            <PersonalInformationForm />
            <ContactInformationForm />
            <SecondarySchoolRecordForm />
          </section>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
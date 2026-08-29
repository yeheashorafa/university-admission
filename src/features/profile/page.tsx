"use client";

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
import { useAuthStore } from "@/stores/auth.store";
import { isUserVerified } from "@/services/auth.service";
import { useLocale } from "next-intl";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function StudentProfilePage() {
  const user = useAuthStore((state) => state.user);
  const locale = useLocale();
  const unverified = isUserVerified(user) === false;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.profile} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        <ProfileHeader />

        {unverified ? (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center shadow-sm">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
            <h2 className="mb-2 text-2xl font-semibold">
              {locale === "ar" ? "حساب غير مفعل" : "Account Not Verified"}
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              {locale === "ar"
                ? "يرجى تفعيل حسابك قبل عرض بيانات الملف الشخصي."
                : "Please verify your account before viewing your profile."}
            </p>
            <Link
              href={`/${locale}/verify-otp?reason=verification`}
              className="inline-flex h-12 items-center justify-center rounded-[16px] bg-primary px-8 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {locale === "ar" ? "تفعيل الحساب" : "Verify Account"}
            </Link>
          </div>
        ) : (
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
        )}
      </main>

      <PortalFooter />
    </div>
  );
}
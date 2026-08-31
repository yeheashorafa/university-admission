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
import { isUserVerified } from "@/services/auth.service";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { useLocale } from "next-intl";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { useMyProfileQuery } from "@/hooks/queries/use-profile-queries";
import { useSocialInformationQuery } from "@/hooks/queries/use-social-information-queries";
import { extractApiError, isVerificationError } from "@/lib/api/api-error";
import { isAccountVerificationBypassed } from "@/lib/auth-verification";
import { getStudentNationalId } from "@/lib/adapters/student-profile-adapter";

import { Loader2 } from "lucide-react";

export function StudentProfilePage() {
  const { user, isHydrated } = useCurrentAuth();
  const locale = useLocale();

  
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    status
  } = useMyProfileQuery();

  const { data: socialInformation } = useSocialInformationQuery();

  const nationalId = getStudentNationalId({
    profile,
    user,
    socialInformation,
  });

  const unverified = isUserVerified(user) === false;

  let content;

  if (!isHydrated) {
    content = (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">
          {locale === "ar" ? "جاري تحميل الجلسة..." : "Loading session..."}
        </p>
      </div>
    );
  } else if (unverified) {
    content = (
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
    );
  } else if (isLoading || (isFetching && status === "pending")) {
    content = (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  } else if (isError) {
    const apiError = extractApiError(error);
    const isVerifyError = isVerificationError(error);
    const isAuthError = apiError.status === 401;

    if (isVerifyError && !isAccountVerificationBypassed()) {
      content = (
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
      );
    } else if (isVerifyError && isAccountVerificationBypassed()) {
      content = (
        <div className="flex flex-col items-center justify-center rounded-xl border border-amber-300/50 bg-amber-50 p-12 text-center shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
          <AlertCircle className="mb-4 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 text-2xl font-semibold text-amber-900 dark:text-amber-200">
            {locale === "ar" ? "تعذر تحميل بيانات الملف الشخصي" : "Unable to load profile data"}
          </h2>
          <p className="mb-6 max-w-md text-amber-800 dark:text-amber-300 font-medium">
            {locale === "ar"
              ? "الباك ما زال يطلب تفعيل الحساب. يرجى تفعيل التجاوز المؤقت من جهة الباك."
              : "Backend still requires account verification. Please ask the backend team to enable the temporary verification bypass."}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex h-12 items-center justify-center rounded-[16px] bg-primary px-8 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            {locale === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      );
    } else if (isAuthError) {
      // Normal session handling will catch this, but just in case we render a fallback
      content = null; 
    } else {
      content = (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center shadow-sm">
          <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
          <h2 className="mb-2 text-2xl font-semibold">
            {locale === "ar" ? "خطأ في التحميل" : "Loading Error"}
          </h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            {locale === "ar" ? "تعذر تحميل بيانات الملف الشخصي." : "Unable to load profile data."}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex h-12 items-center justify-center rounded-[16px] bg-primary px-8 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            {locale === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      );
    }
  } else {
    content = (
      <>
        <ProfileHeader profile={profile} nationalId={nationalId} isLoading={isLoading} isError={isError} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <aside className="flex flex-col gap-6 xl:col-span-4">
            <ProfileCompletionCard />
            <AcademicSummaryCard />
            <AccountSecurityCard />
          </aside>

          <section className="flex flex-col gap-6 xl:col-span-8">
            <PersonalInformationForm nationalId={nationalId} />
            <ContactInformationForm />
            <SecondarySchoolRecordForm />
          </section>
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.profile} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        {content}
      </main>

      <PortalFooter />
    </div>
  );
}
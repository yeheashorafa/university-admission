"use client";

import { useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  FileText,
  FolderKanban,
  Search,
  CreditCard,
  Sparkles,
  GraduationCap,
  ArrowRight,
  ShieldCheck,

  LayoutDashboard,
  Building2,
  ClipboardList,
  Layers,
  UserCheck,
  Lock,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { isAdminRole, isStudentRole } from "@/constants/roles";
import { useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";

const emptySubscribe = () => () => {};

export function LandingPortalHero() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { user, isAuthenticated, role } = useCurrentAuth();
  const router = useRouter();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const { data: apiApps } = useStudentApplicationsQuery();
  const studentApps = Array.isArray(apiApps) ? apiApps : [];
  const latestApp = studentApps[0];

  const [trackQuery, setTrackQuery] = useState("");

  function handleSearchTrack(e: React.FormEvent) {
    e.preventDefault();
    const query = trackQuery.trim();
    if (!query) return;

    if (!isAuthenticated) {
      router.push(withLocale(locale, routes.login));
      return;
    }

    import("sweetalert2").then((Swal) => {
      Swal.default.fire({
        title: "عملية معلقة (PENDING_BACKEND_API)",
        text: "Endpoint documented but not enabled in current backend deployment.",
        icon: "info",
      });
    });
  }

  const newAppHref = !isAuthenticated
    ? routes.register
    : isStudentRole(role)
      ? routes.newApplication
      : routes.admin;

  const myAppsHref = !isAuthenticated
    ? routes.login
    : isStudentRole(role)
      ? routes.applications
      : routes.admin;

  const isStudent = mounted && isAuthenticated && isStudentRole(role);
  const isAdmin = mounted && isAuthenticated && isAdminRole(role);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#eaf7e7] via-[#d9efd4] to-[#f7fff5] dark:from-[#12360b] dark:via-[#0d2b08] dark:to-[#081e05] p-6 sm:p-10 lg:p-14 text-slate-900 dark:text-white shadow-2xl">
      {/* Background Decorative Lighting */}
      <div className="absolute -end-24 -top-24 size-96 rounded-full bg-[#76BC21]/20 dark:bg-[#76BC21]/15 blur-3xl pointer-events-none" />
      <div className="absolute -start-24 -bottom-24 size-96 rounded-full bg-[#0396E9]/15 dark:bg-[#0396E9]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
        {/* Left / Main Text Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#12360b]/10 dark:bg-white/10 px-4 py-1.5 backdrop-blur-md border border-[#12360b]/15 dark:border-white/15">
            <span className="flex size-2 rounded-full bg-[#256b12] dark:bg-[#76BC21] animate-pulse" />
            <span className="text-xs font-extrabold tracking-wide text-[#205b0f] dark:text-[#76BC21]">
              {isAr
                ? "الجامعة الإسلامية بغزة • بوابة القبول والخدمات الإلكترونية"
                : "Islamic University of Gaza • E-Admission & Services Gateway"}
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl font-black leading-tight sm:text-4xl lg:text-5xl text-slate-900 dark:text-white">
            {isAr ? (
              <>
                قدم أكثر من طلب قبول{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b6b0e] via-[#2d9118] to-[#40b822] dark:from-[#76BC21] dark:via-[#8bd63a] dark:to-[#a6f054]">
                  وتابع كافة ملفاتك إلكترونياً
                </span>
              </>
            ) : (
              <>
                Submit multiple applications &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b6b0e] via-[#2d9118] to-[#40b822] dark:from-[#76BC21] dark:via-[#8bd63a] dark:to-[#a6f054]">
                  track your status digitally
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-200/90 sm:text-base">
            {isAr
              ? "بوابة خدمات طلابية متكاملة تتيح لك اختيار الكلية أولاً ثم البرامج، تقديم طلبات متعددة، متابعة التدقيق الآلي للوثائق بالذكاء الاصطناعي، سداد الرسوم، واستكمال نموذج البحث الاجتماعي للمنح."
              : "An integrated university portal allowing students to select faculties, submit multiple applications, monitor AI document verification, pay fees online, and submit social research forms."}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={withLocale(locale, newAppHref)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#76BC21] px-6 text-sm font-black text-[#0d2b08] shadow-lg shadow-[#76BC21]/25 hover:bg-[#86cd29] transition active:scale-95"
            >
              <FileText className="size-5" />
              <span>
                {isAdmin
                  ? isAr
                    ? "لوحة الإدارة"
                    : "Admin Panel"
                  : isAr
                    ? "تقديم طلب جديد"
                    : "Submit New Application"}
              </span>
            </Link>

            <Link
              href={withLocale(locale, myAppsHref)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#0d2b08]/20 dark:border-white/25 bg-[#0d2b08]/10 dark:bg-white/10 px-6 text-sm font-bold text-[#0d2b08] dark:text-white backdrop-blur-sm hover:bg-[#0d2b08]/15 dark:hover:bg-white/20 transition active:scale-95"
            >
              <FolderKanban className="size-5 text-[#256b12] dark:text-[#76BC21]" />
              <span>
                {isAdmin
                  ? isAr
                    ? "إدارة الطلبات"
                    : "Manage Applications"
                  : isAr
                    ? "طلباتي"
                    : "My Applications"}
              </span>
            </Link>
          </div>

          {/* Quick Application Tracker Input (Mock Search Frontend Only) */}
          <div className="pt-4">
            <form
              onSubmit={handleSearchTrack}
              className="relative max-w-xl rounded-2xl bg-white/70 dark:bg-white/10 p-2 backdrop-blur-md border border-[#0d2b08]/15 dark:border-white/20 shadow-lg flex items-center gap-2"
            >
              <Search className="size-5 text-[#256b12] dark:text-[#76BC21] ms-2 shrink-0" />
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder={
                  isAr
                    ? "أدخل رقم الطلب بعد تسجيل الدخول"
                    : "Enter application number after login"
                }
                className="w-full bg-transparent px-2 py-1.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-300 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 inline-flex h-10 items-center justify-center rounded-xl bg-[#76BC21] px-4 text-xs font-black text-[#0d2b08] hover:bg-[#86cd29] transition"
              >
                {isAr ? "تتبع الطلب" : "Track"}
              </button>
            </form>

          </div>

          {/* Institutional Key Metrics */}
          <div className="pt-4 border-t border-[#0d2b08]/15 dark:border-white/10 grid grid-cols-4 gap-2 text-center sm:text-start">
            <div>
              <p className="text-lg sm:text-xl font-black text-[#256b12] dark:text-[#76BC21]">
                12+
              </p>
              <p className="text-2xs text-slate-600 dark:text-slate-300">
                {isAr ? "كليات أكاديمية" : "Faculties"}
              </p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-[#256b12] dark:text-[#76BC21]">
                80+
              </p>
              <p className="text-2xs text-slate-600 dark:text-slate-300">
                {isAr ? "تخصصاً دراسياً" : "Programs"}
              </p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-[#256b12] dark:text-[#76BC21]">
                98%
              </p>
              <p className="text-2xs text-slate-600 dark:text-slate-300">
                {isAr ? "دقة التدقيق الآلي" : "AI Verification"}
              </p>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black text-[#0284c7] dark:text-[#0396E9]">
                100%
              </p>
              <p className="text-2xs text-slate-600 dark:text-slate-300">
                {isAr ? "خدمات إلكترونية" : "Digital Portal"}
              </p>
            </div>
          </div>
        </div>

        {/* Right Preview Column: Dynamic according to Auth State */}
        <div className="lg:col-span-5">
          {/* CASE A: LOGGED IN STUDENT CARD */}
          {isStudent ? (
            <div className="relative rounded-2xl border border-[#0d2b08]/15 dark:border-white/20 bg-white/70 dark:bg-white/10 p-5 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#0d2b08]/10 dark:border-white/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-[#256b12]/15 dark:bg-[#76BC21]/20 flex items-center justify-center text-[#256b12] dark:text-[#76BC21]">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {user?.name ??
                        (isAr ? "طالب القبول" : "Student Applicant")}
                    </p>
                    <p className="text-2xs text-slate-600 dark:text-slate-300">
                      {user?.email ??
                        (isAr ? "طالب مسجل" : "Registered Student")}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#256b12]/15 dark:bg-[#76BC21]/20 px-2.5 py-0.5 text-2xs font-extrabold text-[#256b12] dark:text-[#76BC21] border border-[#256b12]/20 dark:border-[#76BC21]/30">
                  {isAr
                    ? `${studentApps.length} طلبات مقدمة`
                    : `${studentApps.length} Applications`}
                </span>
              </div>

              {latestApp ? (
                <div className="space-y-3 rounded-xl bg-white/80 dark:bg-black/40 p-4 border border-[#0d2b08]/10 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#256b12] dark:text-[#76BC21]">
                      {latestApp.applicationNo}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0396E9]/15 dark:bg-[#0396E9]/20 px-2.5 py-0.5 text-2xs font-bold text-[#0284c7] dark:text-[#0396E9] border border-[#0396E9]/30">
                      <CreditCard className="size-3" />
                      {latestApp.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {latestApp.programName}
                    </p>
                    <p className="text-2xs text-slate-600 dark:text-slate-300">
                      {latestApp.facultyName}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[#256b12]/10 dark:bg-[#76BC21]/15 p-3 border border-[#256b12]/20 dark:border-[#76BC21]/30">
                    <div className="space-y-0.5">
                      <p className="text-2xs font-bold text-[#256b12] dark:text-[#76BC21]">
                        {isAr ? "الإجراء التالي:" : "Next Action:"}
                      </p>
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {isAr
                          ? "متابعة حالة الطلب والخدمات الإلكترونية"
                          : "Continue application & services"}
                      </p>
                    </div>
                    <Link
                      href={withLocale(locale, routes.applications)}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-[#76BC21] px-3 text-2xs font-black text-[#0d2b08] hover:bg-[#86cd29] transition"
                    >
                      {isAr ? "عرض الطلب" : "View App"}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white/80 dark:bg-black/40 p-4 border border-[#0d2b08]/10 dark:border-white/10 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {isAr
                      ? "لم تقم بتقديم طلبات قبول بعد"
                      : "No applications submitted yet"}
                  </p>
                  <Link
                    href={withLocale(locale, routes.newApplication)}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-[#76BC21] px-4 text-xs font-black text-[#0d2b08] hover:bg-[#86cd29] transition"
                  >
                    {isAr ? "تقديم طلب قبول جديد" : "Submit New Application"}
                  </Link>
                </div>
              )}
            </div>
          ) : isAdmin ? (
            /* CASE B: LOGGED IN ADMIN / STAFF CARD */
            <div className="relative rounded-2xl border border-[#0d2b08]/15 dark:border-white/20 bg-white/70 dark:bg-white/10 p-5 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#0d2b08]/10 dark:border-white/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-[#0396E9]/20 flex items-center justify-center text-[#0284c7] dark:text-[#0396E9]">
                    <UserCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {user?.name ??
                        (isAr ? "موظف القبول والتسجيل" : "Admission Officer")}
                    </p>
                    <p className="text-2xs text-slate-600 dark:text-slate-300 capitalize">
                      {role}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[#0396E9]/20 px-2.5 py-0.5 text-2xs font-extrabold text-[#0284c7] dark:text-[#0396E9] border border-[#0396E9]/30">
                  {isAr ? "لوحة الإدارة" : "Admin Panel"}
                </span>
              </div>

              <div className="space-y-2.5">
                <Link
                  href={withLocale(locale, routes.admin)}
                  className="flex items-center justify-between rounded-xl bg-white/60 dark:bg-white/5 p-3 border border-[#0d2b08]/10 dark:border-white/10 text-xs text-slate-800 dark:text-white hover:bg-white/90 dark:hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-2">
                    <FolderKanban className="size-4 text-[#256b12] dark:text-[#76BC21]" />
                    <span>
                      {isAr
                        ? "لوحة مهام موظف القبول"
                        : "Admissions Officer Task Board"}
                    </span>
                  </div>
                  <ArrowRight className="size-4 rtl:rotate-180 text-slate-500 dark:text-slate-400" />
                </Link>

                <Link
                  href={withLocale(locale, routes.adminManualReview)}
                  className="flex items-center justify-between rounded-xl bg-white/60 dark:bg-white/5 p-3 border border-[#0d2b08]/10 dark:border-white/10 text-xs text-slate-800 dark:text-white hover:bg-white/90 dark:hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
                    <span>
                      {isAr
                        ? "طلبات فشل التحقق الآلي منها"
                        : "Applications with Failed AI Verification"}
                    </span>
                  </div>
                  <ArrowRight className="size-4 rtl:rotate-180 text-slate-500 dark:text-slate-400" />
                </Link>

                <Link
                  href={withLocale(locale, routes.adminDocumentVerification)}
                  className="flex items-center justify-between rounded-xl bg-white/60 dark:bg-white/5 p-3 border border-[#0d2b08]/10 dark:border-white/10 text-xs text-slate-800 dark:text-white hover:bg-white/90 dark:hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-4 text-[#0284c7] dark:text-[#0396E9]" />
                    <span>
                      {isAr
                        ? "مراجعة المستندات يدويًا"
                        : "Manual Document Review"}
                    </span>
                  </div>
                  <ArrowRight className="size-4 rtl:rotate-180 text-slate-500 dark:text-slate-400" />
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href={withLocale(locale, routes.admin)}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0396E9] text-xs font-black text-white shadow-md hover:bg-[#0396E9]/90 transition"
                >
                  <LayoutDashboard className="size-4" />
                  <span>
                    {isAr
                      ? "الذهاب إلى لوحة الإدارة الكاملة"
                      : "Go to Admin Dashboard"}
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            /* CASE C: GUEST / UNAUTHENTICATED (GENERIC PUBLIC PORTAL PREVIEW CARD) */
            <div className="relative rounded-2xl border border-[#0d2b08]/15 dark:border-white/20 bg-white/70 dark:bg-white/10 p-5 backdrop-blur-xl shadow-2xl space-y-4">
              {/* Header of Public Portal Preview */}
              <div className="flex items-center justify-between border-b border-[#0d2b08]/10 dark:border-white/15 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-[#256b12]/15 dark:bg-[#76BC21]/20 flex items-center justify-center text-[#256b12] dark:text-[#76BC21]">
                    <GraduationCap className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {isAr
                        ? "معاينة خدمات بوابة القبول"
                        : "Admission Portal Preview"}
                    </p>
                    <p className="text-2xs text-slate-600 dark:text-slate-300">
                      {isAr
                        ? "بوابة الخدمات الإلكترونية الموحدة"
                        : "Unified Digital Services Portal"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center rounded-full bg-[#256b12]/15 dark:bg-[#76BC21]/20 px-3 py-1 text-xs font-extrabold text-[#256b12] dark:text-[#76BC21] border border-[#256b12]/20 dark:border-[#76BC21]/30">
                  <p className="">
                    {isAr ? "منظومة إلكترونية" : "Public Services"}{" "}
                  </p>
                </div>
              </div>

              {/* 3 Public Service Preview Feature Cards */}
              <div className="space-y-2.5">
                {/* Feature 1 */}
                <div className="rounded-xl bg-white/80 dark:bg-black/30 p-3 border border-[#0d2b08]/10 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Building2 className="size-4 text-[#256b12] dark:text-[#76BC21]" />
                    <span>
                      {isAr
                        ? "1. تقديم طلب قبول جديد"
                        : "1. Submit New Application"}
                    </span>
                  </div>
                  <p className="text-2xs text-slate-600 dark:text-slate-300 leading-relaxed ps-6">
                    {isAr
                      ? "اختر الكلية، حدد التخصصات المطلوبة، وارفع المستندات بسهولة."
                      : "Select your faculty, rank your choices, and upload required document scans."}
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="rounded-xl bg-white/80 dark:bg-black/30 p-3 border border-[#0d2b08]/10 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <Search className="size-4 text-[#0284c7] dark:text-[#0396E9]" />
                    <span>
                      {isAr
                        ? "2. تتبع حالة الطلب بالرقم"
                        : "2. Track Application Status"}
                    </span>
                  </div>
                  <p className="text-2xs text-slate-600 dark:text-slate-300 leading-relaxed ps-6">
                    {isAr
                      ? "تابع كل طلب من التقديم والتدقيق الذكي حتى الاعتماد النهائي."
                      : "Follow each application from AI verification to department head approval."}
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="rounded-xl bg-white/80 dark:bg-black/30 p-3 border border-[#0d2b08]/10 dark:border-white/10 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                    <ClipboardList className="size-4 text-[#256b12] dark:text-[#76BC21]" />
                    <span>
                      {isAr
                        ? "3. إكمال الإجراءات والمنح"
                        : "3. Complete Post-Approval Actions"}
                    </span>
                  </div>
                  <p className="text-2xs text-slate-600 dark:text-slate-300 leading-relaxed ps-6">
                    {isAr
                      ? "سداد الرسوم الإلكترونية واستكمال نموذج البحث الاجتماعي للمنح."
                      : "Pay admission fees online to issue Student ID & apply for scholarships."}
                  </p>
                </div>
              </div>

              {/* 4 Feature Badges at Bottom */}
              <div className="pt-2 border-t border-[#0d2b08]/10 dark:border-white/10 grid grid-cols-2 gap-2 text-2xs font-extrabold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-1.5 rounded-lg bg-white/60 dark:bg-white/5 p-1.5 border border-[#0d2b08]/10 dark:border-white/10">
                  <Layers className="size-3.5 text-[#256b12] dark:text-[#76BC21]" />
                  <span>{isAr ? "طلبات متعددة" : "Multi-Applications"}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/60 dark:bg-white/5 p-1.5 border border-[#0d2b08]/10 dark:border-white/10">
                  <Sparkles className="size-3.5 text-purple-600 dark:text-purple-300" />
                  <span>{isAr ? "تدقيق ذكاء اصطناعي" : "AI Verification"}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/60 dark:bg-white/5 p-1.5 border border-[#0d2b08]/10 dark:border-white/10">
                  <CreditCard className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isAr ? "دفع إلكتروني" : "Digital Payment"}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-white/60 dark:bg-white/5 p-1.5 border border-[#0d2b08]/10 dark:border-white/10">
                  <ShieldCheck className="size-3.5 text-[#0284c7] dark:text-[#0396E9]" />
                  <span>{isAr ? "تتبع الحالة" : "Status Tracking"}</span>
                </div>
              </div>

              {/* Action Button for Guest */}
              <div className="pt-1">
                <Link
                  href={withLocale(locale, routes.register)}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#76BC21] text-xs font-black text-[#0d2b08] shadow-md hover:bg-[#86cd29] transition active:scale-95"
                >
                  <Lock className="size-4" />
                  <span>
                    {isAr
                      ? "إنشاء حساب كطالب لبدء القبول"
                      : "Create Student Account to Start"}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

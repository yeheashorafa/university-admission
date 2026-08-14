"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  FileCheck2,
  FileSearch,
  AlertOctagon,
  Clock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useEmployeeApplicationsQuery } from "@/hooks/queries/use-admin-queries";
import {
  flattenPendingDocumentQueue,
  isPendingManualReview,
  type RawBackendApplication,
} from "@/features/admin/document-verification/utils/document-verification-filter";

export function EmployeeOperationalDashboard() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const { data: rawAppsData, isLoading } = useEmployeeApplicationsQuery();
  const applications = (Array.isArray(rawAppsData) ? rawAppsData : []) as RawBackendApplication[];

  // Document verification count = total flattened pending documents
  const pendingDocumentsCount = flattenPendingDocumentQueue(applications).length;

  // Manual review applications count
  const manualReviewApps = applications.filter(isPendingManualReview);

  // AI failed applications count
  const aiFailedApps = applications.filter((app) => {
    const aiStatus = String(
      app.aiVerificationStatus || app.ai_check_status || app.ai_status || app.status || ""
    ).toLowerCase();
    return aiStatus.includes("fail");
  });

  return (
    <div className="space-y-8">
      {/* Employee Header */}
      <header className="rounded-2xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">
          {isAr ? "لوحة مهام موظف القبول" : "Admission Employee Workspace"}
        </h1>
        <p className="mt-2 leading-7 text-muted-foreground">
          {isAr
            ? "مرحباً بك. يرجى التركيز على المهام التشغيلية اليومية من تدقيق المستندات والمراجعة اليدوية للطلبات."
            : "Welcome. Focus on daily operational tasks including document verification and manual application reviews."}
        </p>
      </header>

      {/* Operational Task Queues Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Applications */}
        <Link
          href={withLocale(locale, routes.adminManualReview)}
          className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-6" />
            </div>
            <span className="text-2xl font-extrabold text-primary">
              {isLoading ? "..." : manualReviewApps.length}
            </span>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary">
            {isAr ? "طلبات قيد المراجعة اليدوية" : "Pending Manual Reviews"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "طلبات تتطلب قرار موظف القبول" : "Applications requiring decision"}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
            <span>{isAr ? "الانتقال إلى القائمة" : "Go to queue"}</span>
            <ArrowIcon className="size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </div>
        </Link>

        {/* AI Failed Applications */}
        <Link
          href={withLocale(locale, routes.adminManualReview)}
          className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-destructive hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertOctagon className="size-6" />
            </div>
            <span className="text-2xl font-extrabold text-destructive">
              {isLoading ? "..." : aiFailedApps.length}
            </span>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-destructive">
            {isAr ? "فشل التحقق الآلي (AI)" : "AI Verification Failures"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "طلبات تتطلب فحصاً يدويأً دقيقاً" : "Requires careful manual check"}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-destructive">
            <span>{isAr ? "معالجة الحالات" : "Process cases"}</span>
            <ArrowIcon className="size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </div>
        </Link>

        {/* Document Verification Queue */}
        <Link
          href={withLocale(locale, routes.adminDocumentVerification)}
          className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-secondary hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <FileCheck2 className="size-6" />
            </div>
            <span className="text-2xl font-extrabold text-secondary">
              {isLoading ? "..." : pendingDocumentsCount}
            </span>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-secondary">
            {isAr ? "مستندات بانتظار التحقق" : "Documents Pending Verification"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "فحص واعتماد وثائق الطلبة" : "Verify and approve student document files"}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-secondary">
            <span>{isAr ? "بدء التدقيق" : "Start verification"}</span>
            <ArrowIcon className="size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </div>
        </Link>

        {/* Manual Review Queue */}
        <Link
          href={withLocale(locale, routes.adminManualReview)}
          className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSearch className="size-6" />
            </div>
            <span className="text-2xl font-extrabold text-primary">
              {isLoading ? "..." : manualReviewApps.length}
            </span>
          </div>
          <h3 className="font-bold text-foreground group-hover:text-primary">
            {isAr ? "طابور المراجعة التشغيلية" : "Manual Review Queue"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "اتخاذ القرارات وتحديث الحالات" : "Make decisions and update status"}
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
            <span>{isAr ? "استعراض الطابور" : "Review queue"}</span>
            <ArrowIcon className="size-4 transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </div>
        </Link>
      </section>

      {/* Operational Actions Table/List */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">
            {isAr ? "الطلبات الحالية بانتظار إجرائك" : "Applications Awaiting Your Action"}
          </h2>
          <Link
            href={withLocale(locale, routes.adminManualReview)}
            className="text-sm font-bold text-secondary hover:underline"
          >
            {isAr ? "عرض الكل" : "View All"}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="p-3 text-start">{isAr ? "رقم الطلب" : "App No"}</th>
                <th className="p-3 text-start">{isAr ? "اسم الطالب" : "Student Name"}</th>
                <th className="p-3 text-start">{isAr ? "البرنامج" : "Program"}</th>
                <th className="p-3 text-start">{isAr ? "الحالة الحالية" : "Current Status"}</th>
                <th className="p-3 text-center">{isAr ? "الإجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    {isAr ? "جاري تحميل الطلبات..." : "Loading applications..."}
                  </td>
                </tr>
              ) : manualReviewApps.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    {isAr ? "لا توجد طلبات بانتظار إجرائك حالياً." : "No applications currently awaiting action."}
                  </td>
                </tr>
              ) : (
                manualReviewApps.slice(0, 5).map((app) => {
                  const appNo = app.applicationNo || app.application_no || `APP-${app.id}`;
                  const name = app.studentName || app.student_name || "طالب غير محدد";
                  const prog = app.program || "برنامج غير محدد";
                  const appStatus = String(app.status || "under_review");

                  return (
                    <tr key={app.id} className="hover:bg-muted/30">
                      <td className="p-3 font-bold text-primary">{appNo}</td>
                      <td className="p-3 font-medium text-foreground">{name}</td>
                      <td className="p-3 text-muted-foreground">{prog}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                          {appStatus.includes("ai") || appStatus.includes("fail")
                            ? isAr
                              ? "فشل تحقق الذكاء الاصطناعي"
                              : "AI Failed"
                            : isAr
                              ? "قيد المراجعة"
                              : "Under Review"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Link
                          href={withLocale(
                            locale,
                            `${routes.adminDocumentVerification}/${app.id}`
                          )}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                        >
                          {isAr ? "تدقيق الطلب" : "Verify Application"}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

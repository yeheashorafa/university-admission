"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { StudentWorkflowProgress } from "./components/student-workflow-progress";
import { StudentStatusHeader } from "./components/student-status-header";
import { StudentStatusSummary } from "./components/student-status-summary";
import { StudentWorkflowTimeline } from "./components/student-workflow-timeline";
import { StudentRequiredAction } from "./components/student-required-action";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { routes } from "@/constants/routes";
import { PortalFooter } from "@/components/layouts/portal-footer";
import { useStudentApplicationsQuery, useStudentApplicationDetailsQuery } from "@/hooks/queries/use-application-queries";
import { getStatusConfig } from "@/lib/adapters/status-adapter";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";

type StatusPageProps = {
  applicationId?: string;
};

export function StatusPage({ applicationId }: StatusPageProps) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const targetId = applicationId ?? searchParams?.get("id") ?? undefined;

  const { data: detailApp, isLoading: loadingDetail } = useStudentApplicationDetailsQuery(targetId);
  const { data: appsList, isLoading: loadingList, isError, error, refetch } = useStudentApplicationsQuery();

  const liveApp = detailApp || appsList?.[0] || null;
  const isLoading = loadingDetail || loadingList;

  const notAvailable = locale === "ar" ? "غير متوفر" : "N/A";

  const formattedApp: WorkflowApplication | null = liveApp
    ? ({
        id: String(liveApp.id),
        applicationNo: liveApp.applicationNo || String(liveApp.id),
        studentName: liveApp.applicantName || notAvailable,
        nationalId: liveApp.applicantNationalId || notAvailable,
        selectedProgram: liveApp.programName || notAvailable,
        faculty: liveApp.facultyName || notAvailable,
        average: notAvailable,
        currentStatus: liveApp.status || "submitted",
        aiConfidence: 0,
        createdAt: liveApp.createdAt || liveApp.submittedAt || new Date().toISOString().split("T")[0],
        socialResearchStatus: "not_required",
        workflowLogs: [
          {
            id: "1",
            status: liveApp.status || "submitted",
            actor: "student",
            decision: "submitted",
            actorName: locale === "ar" ? "الطالب" : "Student",
            note: `${locale === "ar" ? "حالة الطلب الحالية" : "Current status"}: ${getStatusConfig(liveApp.status).labelEn}`,
            createdAt: liveApp.createdAt || new Date().toLocaleString(),
          },
        ],
      } as WorkflowApplication)
    : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PortalNavbar activePath={routes.status} />
      <div className="app-container space-y-6 py-8 md:py-12">
        {isLoading ? (
          <div className="space-y-6">
            <div className="rounded-[28px] border border-border bg-card p-8 space-y-4">
              <Skeleton className="h-8 w-64 rounded-xl" />
              <Skeleton className="h-4 w-96 rounded-md" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 rounded-2xl border border-border bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
              <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-6 space-y-4">
                <Skeleton className="h-6 w-36 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center space-y-3">
            <AlertTriangle className="size-8 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-800">
              {locale === "ar" ? "فشل التعرف على طلبات القبول" : "Failed to load application status"}
            </h3>
            <p className="text-xs text-red-600">
              {(error as Error)?.message || (locale === "ar" ? "تعذر الاتصال بالخادم" : "Server connection error")}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700"
            >
              {locale === "ar" ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : !formattedApp ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            {locale === "ar" ? "لم يتم العثور على طلبات قبول مسجلة." : "No submitted applications found."}
          </div>
        ) : (
          <>
            <StudentStatusHeader application={formattedApp} locale={locale} />
            <StudentStatusSummary application={formattedApp} />
            <StudentWorkflowProgress application={formattedApp} />

            <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <StudentWorkflowTimeline
                logs={formattedApp.workflowLogs}
                currentStatus={formattedApp.currentStatus}
              />

              <StudentRequiredAction application={formattedApp} locale={locale} />
            </div>
          </>
        )}
      </div>
      <PortalFooter />
    </main>
  );
}

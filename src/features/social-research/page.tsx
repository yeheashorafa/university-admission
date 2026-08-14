"use client";


import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { AlertTriangle } from "lucide-react";

import { useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";
import type { SocialResearchFormValues } from "./data/social-research.data";
import { SocialResearchHeader } from "./components/social-research-header";
import { SocialResearchStudentCard } from "./components/social-research-student-card";
import { SocialResearchForm } from "./components/social-research-form";
import { SocialResearchSubmittedCard } from "./components/social-research-submitted-card";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";
import { StudentWorkflowTimeline } from "@/features/status/components/student-workflow-timeline";
import { PortalFooter } from "@/components/layouts/portal-footer";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { routes } from "@/constants/routes";

type SocialResearchPageProps = {
  applicationId?: string;
};

export function SocialResearchPage({ applicationId }: SocialResearchPageProps) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const targetId = applicationId ?? searchParams?.get("id") ?? undefined;

  const { data: apiApps } = useStudentApplicationsQuery();
  const safeApps = Array.isArray(apiApps) ? apiApps : [];
  
  const apiApp = safeApps.find((app) => String(app.id) === targetId) || safeApps[0];
  
  const application: WorkflowApplication | undefined = apiApp ? {
    id: String(apiApp.id),
    applicationNo: apiApp.applicationNo || String(apiApp.id),
    studentName: apiApp.applicantName || "N/A",
    nationalId: apiApp.applicantNationalId || "N/A",
    selectedProgram: apiApp.programName || "N/A",
    faculty: apiApp.facultyName || "N/A",
    average: "N/A",
    aiConfidence: 100,
    currentStatus: apiApp.status || "submitted",
    createdAt: apiApp.createdAt || apiApp.submittedAt || new Date().toISOString(),
    socialResearchStatus: "not_required",
    workflowLogs: []
  } : undefined;

  const submitted = application?.currentStatus === "completed";

  async function handleSubmitForm(values: SocialResearchFormValues) {
    void values;
    
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "إرسال بيانات البحث الاجتماعي معطل حالياً بانتظار تفعيل نقطة النهاية من الخادم.",
      icon: "info",
    });
  }

  if (!application) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <PortalNavbar activePath={routes.socialResearch} />
        <div className="app-container py-12 text-center text-sm text-muted-foreground">
          {locale === "ar" ? "لم يتم العثور على طلب بحاجة لبحث اجتماعي." : "No application requiring social research found."}
        </div>
        <PortalFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PortalNavbar activePath={routes.socialResearch} />

      <div className="app-container space-y-6 py-8 md:py-12">
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>PENDING_BACKEND_API:</strong> خدمة تقديم البحث الاجتماعي غير مفعّلة حالياً على الخادم. النماذج والأزرار معطلة لحين تفعيل الخدمة.
          </span>
        </div>

        <SocialResearchHeader />

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <SocialResearchStudentCard application={application} />

            {submitted ? (
              <SocialResearchSubmittedCard locale={locale} />
            ) : (
              <SocialResearchForm onSubmitForm={handleSubmitForm} />
            )}
          </div>

          <StudentWorkflowTimeline
            logs={application.workflowLogs}
            currentStatus={application.currentStatus}
          />
        </div>
      </div>
      <PortalFooter />
    </main>
  );
}
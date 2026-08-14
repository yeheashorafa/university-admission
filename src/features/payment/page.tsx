"use client";

import { useSearchParams } from "next/navigation";
import { routes } from "@/constants/routes";
import { PaymentStatusCard } from "./components/payment-status-card";
import { PortalNavbar } from "../../components/layouts/portal-navbar";
import { PortalFooter } from "../../components/layouts/portal-footer";
import { PaymentHeader } from "./components/payment-header";
import { PaymentMethodCard } from "./components/payment-method-card";
import { PaymentSummaryCard } from "./components/payment-summary-card";
import { PaymentInvoiceCard } from "./components/payment-invoice-card";

import { useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";
import { AlertTriangle } from "lucide-react";

type StudentPaymentPageProps = {
  applicationId?: string;
};

export function StudentPaymentPage({ applicationId }: StudentPaymentPageProps) {
  const searchParams = useSearchParams();
  const targetId = applicationId ?? searchParams?.get("id") ?? undefined;

  const { data: apiApps } = useStudentApplicationsQuery();
  const safeApps = Array.isArray(apiApps) ? apiApps : [];
  
  // Try to find from API first, if not available just create a fallback shape so UI doesn't crash 
  // since PaymentStatusCard needs some app shape
  const apiApp = safeApps.find((app) => String(app.id) === targetId);
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.payment} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>PENDING_BACKEND_API:</strong> نظام الدفع الإلكتروني بانتظار إتاحة نقاط النهاية (Endpoints) الخاصة بالدفع والفواتير من الخادم. تم تعطيل عمليات الدفع حالياً.
          </span>
        </div>

        <PaymentHeader />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="flex flex-col gap-6 xl:col-span-8">
            <PaymentStatusCard application={application} />
            <PaymentMethodCard />
          </section>

          <aside className="xl:col-span-4">
            <div className="sticky top-28 flex flex-col gap-6">
              <PaymentSummaryCard application={application} />
              <PaymentInvoiceCard application={application} />
            </div>
          </aside>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
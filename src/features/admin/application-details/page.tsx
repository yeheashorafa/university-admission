"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Calendar,
  CreditCard,
  FileText,
  User,
  Loader2,
  AlertCircle,
  IdCard,
  GraduationCap,
  Percent,
} from "lucide-react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  mapBackendApplicationToWorkflowApplication,
  type WorkflowApplication,
} from "../applications/data/applications-workflow.data";
import { ApplicationWorkflowActions } from "../applications/components/application-workflow-actions";
import { ApplicationEmployeeActions } from "../applications/components/application-employee-actions";
import { ApplicationAdminActions } from "../applications/components/application-admin-actions";
import { userRoles } from "@/constants/roles";
import { useAdminApplicationDetailsQuery } from "@/hooks/queries/use-admin-queries";
import type { EmployeeApplication } from "@/services/employee.service";

type AdminApplicationDetailsPageProps = {
  applicationId: string;
};

export function AdminApplicationDetailsPage({
  applicationId,
}: AdminApplicationDetailsPageProps) {
  const { user } = useCurrentAuth();
  const activeSidebarPath =
    user?.role === userRoles.admissionEmployee
      ? routes.adminManualReview
      : routes.adminApplications;

  const { data: apiApp, isLoading, isError } = useAdminApplicationDetailsQuery(applicationId);

  const employeeComments =
    user?.role === userRoles.admissionEmployee && apiApp
      ? ((apiApp as EmployeeApplication).comments ?? [])
      : [];

  const initialApplication = useMemo(() => {
    if (!apiApp) return null;
    return mapBackendApplicationToWorkflowApplication(apiApp as Record<string, unknown>);
  }, [apiApp]);

  if (isLoading) {
    return (
      <AdminLayout activePath={activeSidebarPath}>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-12 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted-foreground">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !initialApplication) {
    return (
      <AdminLayout activePath={activeSidebarPath}>
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
          <AlertCircle className="size-10 text-destructive" />
          <h2 className="text-lg font-bold text-destructive">عفواً، تعذر العثور على الطلب المطلوب</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            الطلب رقم ({applicationId}) غير موجود أو لا تملك الصلاحية الكافية لعرض تفاصيله.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePath={activeSidebarPath}>
      <div className="flex flex-col gap-6">
        <ApplicationDetailsHeader application={initialApplication} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
          <section className="flex flex-col gap-6">
            <ApplicationSummaryCard application={initialApplication} />
          </section>

          <aside className="flex flex-col gap-6">

            <ApplicationWorkflowActions
              applicationId={applicationId}
              status={initialApplication.currentStatus}
              role={user?.role}
            />

            {user?.role === userRoles.admissionEmployee && (
              <ApplicationEmployeeActions
                applicationId={applicationId}
                status={initialApplication.currentStatus}
                comments={employeeComments}
              />
            )}

            {user?.role === userRoles.admin && (
              <ApplicationAdminActions
                applicationId={applicationId}
                status={initialApplication.currentStatus}
              />
            )}
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}

type ApplicationCardProps = {
  application: WorkflowApplication;
};

function ApplicationDetailsHeader({ application }: ApplicationCardProps) {
  const t = useTranslations("admin.applicationWorkflow");
  const isMock = application.id.startsWith("app-") || application.id.startsWith("APP-");

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.08)]">
      <div className="pointer-events-none absolute -end-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -start-20 size-64 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-sm font-bold text-secondary">
              {application.applicationNo}
            </p>
            {isMock && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-extrabold text-amber-800 border border-amber-300">
                Demo / Pending Backend API
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-primary">
            {application.studentName}
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {application.selectedProgram} · {application.faculty}
          </p>
        </div>

        <div className="rounded-[20px] border border-primary/20 bg-primary/10 px-5 py-4">
          <p className="text-sm text-muted-foreground">{t("currentStatus")}</p>
          <p className="mt-1 font-bold text-primary">
            {t(`statuses.${application.currentStatus}`)}
          </p>
        </div>
      </div>
    </section>
  );
}

function ApplicationSummaryCard({ application }: ApplicationCardProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <h2 className="mb-5 text-xl font-bold text-primary">
        {isAr ? "تفاصيل الطلب ومعلومات الطالب" : "Application Details & Student Information"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryItem
          icon={User}
          label={isAr ? "اسم الطالب" : "Student Name"}
          value={application.studentName}
        />

        <SummaryItem
          icon={IdCard}
          label={isAr ? "رقم الهوية" : "National ID"}
          value={application.nationalId}
        />

        <SummaryItem
          icon={GraduationCap}
          label={isAr ? "البرنامج الأكاديمي" : "Program"}
          value={application.selectedProgram}
        />

        <SummaryItem
          icon={FileText}
          label={isAr ? "الكلية" : "Faculty"}
          value={application.faculty}
        />

        <SummaryItem
          icon={Percent}
          label={isAr ? "المعدل" : "Average"}
          value={application.average}
        />

        <SummaryItem
          icon={Calendar}
          label={isAr ? "تاريخ التقديم" : "Submitted At"}
          value={application.createdAt}
        />

        <SummaryItem
          icon={Calendar}
          label={isAr ? "تاريخ التحديث" : "Updated At"}
          value={application.updatedAt ?? application.createdAt}
        />

        <SummaryItem
          icon={CreditCard}
          label={isAr ? "بيانات السداد" : "Payment Status"}
          value={
            application.paymentReference
              ? `${isAr ? "تم السداد" : "Paid"} (${application.paymentReference})`
              : isAr
                ? "بانتظار السداد"
                : "Payment Pending"
          }
        />
      </div>

      {(application.rejectionNote || application.missingDocumentsNote) && (
        <div className="mt-5 rounded-[18px] border border-amber-300/40 bg-amber-500/10 p-4">
          <p className="font-bold text-amber-700 dark:text-amber-300">
            {isAr ? "الملاحظات وتفاصيل القرار" : "Notes & Decision Details"}
          </p>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {application.rejectionNote ?? application.missingDocumentsNote}
          </p>
        </div>
      )}
    </section>
  );
}

type SummaryItemProps = {
  icon: typeof User;
  label: string;
  value: string;
};

function SummaryItem({ icon: Icon, label, value }: SummaryItemProps) {
  return (
    <div className="rounded-[18px] border border-border bg-background p-4">
      <div className="mb-3 flex size-10 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>

      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}

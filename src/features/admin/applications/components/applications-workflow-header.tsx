"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, Clock3, FileCheck2, FileX2 } from "lucide-react";
import {
  applicationStatuses,
  type ApplicationStatus,
} from "@/constants/application-workflow";
import type { WorkflowApplication } from "../data/applications-workflow.data";

type ApplicationsWorkflowHeaderProps = {
  applications: WorkflowApplication[];
};

export function ApplicationsWorkflowHeader({
  applications,
}: ApplicationsWorkflowHeaderProps) {
  const t = useTranslations("admin.applications");

  const stats = useMemo(() => {
    const countByStatus = (statuses: ApplicationStatus[]) => {
      return applications.filter((application) =>
        statuses.includes(application.currentStatus)
      ).length;
    };

    return {
      total: applications.length,
      pendingHeadReview: countByStatus([
        applicationStatuses.employeeApproved,
        applicationStatuses.headReview,
      ]),
      paymentPending: countByStatus([applicationStatuses.paymentPending]),
      rejected: countByStatus([
        applicationStatuses.employeeRejected,
        applicationStatuses.headRejected,
        applicationStatuses.aiRejected,
      ]),
    };
  }, [applications]);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.08)] md:p-8">
      <div className="pointer-events-none absolute -end-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -start-20 size-64 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
          <BarChart3 className="size-4" />
          {t("badge")}
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("title")}
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {t("description")}
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-4">
          <StatCard
            icon={BarChart3}
            label={t("totalApplications")}
            value={stats.total}
          />

          <StatCard
            icon={Clock3}
            label={t("pendingHeadReview")}
            value={stats.pendingHeadReview}
          />

          <StatCard
            icon={FileCheck2}
            label={t("paymentPending")}
            value={stats.paymentPending}
          />

          <StatCard
            icon={FileX2}
            label={t("rejectedApplications")}
            value={stats.rejected}
          />
        </div>
      </div>
    </section>
  );
}

type StatCardProps = {
  icon: typeof BarChart3;
  label: string;
  value: number;
};

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-[22px] border border-border bg-background p-4">
      <div className="mb-3 flex size-11 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>

      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-primary">{value}</p>
    </div>
  );
}
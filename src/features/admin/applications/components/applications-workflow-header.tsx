"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, Clock3, FileCheck2, FileX2, Ban, Info } from "lucide-react";

import type { WorkflowApplication } from "../data/applications-workflow.data";
import { applicationStatuses } from "@/constants/application-workflow";

type ApplicationsWorkflowHeaderProps = {
  applications?: WorkflowApplication[];
  isLoading?: boolean;
};

export function ApplicationsWorkflowHeader({
  applications = [],
  isLoading = false,
}: ApplicationsWorkflowHeaderProps) {
  const t = useTranslations("admin.applications");

  const stats = useMemo(() => {
    if (isLoading) {
      return {
        total: "...",
        pendingHeadReview: "...",
        paymentPending: "...",
        rejected: "...",
        cancelled: "...",
      };
    }

    const total = applications.length;
    const pendingHeadReview = applications.filter(
      (app) =>
        app.currentStatus === applicationStatuses.headReview ||
        app.currentStatus === "forwarded_to_department_head"
    ).length;
    const paymentPending = applications.filter(
      (app) => app.currentStatus === applicationStatuses.paymentPending
    ).length;
    const rejected = applications.filter(
      (app) =>
        app.currentStatus === "rejected" ||
        app.currentStatus === applicationStatuses.aiRejected ||
        app.currentStatus === applicationStatuses.employeeRejected ||
        app.currentStatus === applicationStatuses.headRejected
    ).length;
    const cancelled = applications.filter(
      (app) =>
        app.currentStatus === "cancelled" ||
        (app.currentStatus as string) === "canceled"
    ).length;

    return {
      total,
      pendingHeadReview,
      paymentPending,
      rejected,
      cancelled,
    };
  }, [applications, isLoading]);

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

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0 text-primary" />
          <span>{t("currentPageNotice")}</span>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={BarChart3}
            label={t("totalApplications")}
            value={stats.total}
            sublabel={t("pageScopedBadge")}
          />

          <StatCard
            icon={Clock3}
            label={t("pendingHeadReview")}
            value={stats.pendingHeadReview}
            sublabel={t("pageScopedBadge")}
          />

          <StatCard
            icon={FileCheck2}
            label={t("paymentPending")}
            value={stats.paymentPending}
            sublabel={t("pageScopedBadge")}
          />

          <StatCard
            icon={FileX2}
            label={t("rejectedApplications")}
            value={stats.rejected}
            sublabel={t("pageScopedBadge")}
          />

          <StatCard
            icon={Ban}
            label={t("cancelledApplications")}
            value={stats.cancelled}
            sublabel={t("pageScopedBadge")}
          />
        </div>
      </div>
    </section>
  );
}

type StatCardProps = {
  icon: typeof BarChart3;
  label: string;
  value: number | string;
  sublabel?: string;
};

function StatCard({ icon: Icon, label, value, sublabel }: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-[22px] border border-border bg-background p-4">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex size-11 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          {sublabel && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {sublabel}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-primary">{value}</p>
    </div>
  );
}
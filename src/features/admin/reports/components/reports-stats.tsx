"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock3,
  XCircle,
} from "lucide-react";
import type { buildAdminReportsAnalytics } from "../utils/admin-reports-analytics";

type ReportsStatsProps = {
  analytics: ReturnType<typeof buildAdminReportsAnalytics>;
};

export function ReportsStats({ analytics }: ReportsStatsProps) {
  const t = useTranslations("reports");

  const stats = [
    {
      key: "total",
      value: analytics.totalApplications,
      icon: ClipboardList,
    },
    {
      key: "accepted",
      value: analytics.acceptedApplications,
      icon: CheckCircle2,
    },
    {
      key: "pendingReview",
      value: analytics.pendingReviewApplications,
      icon: Clock3,
    },
    {
      key: "rejected",
      value: analytics.rejectedApplications,
      icon: XCircle,
    },
    {
      key: "aiFailed",
      value: analytics.aiFailedApplications,
      icon: AlertTriangle,
    },
    {
      key: "averageAi",
      value: "N/A",
      icon: Bot,
    },
  ] as const;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.key}
            className="rounded-[24px] border border-border bg-card p-5 shadow-[0px_12px_35px_rgba(118,188,33,0.06)]"
          >
            <div className="mb-5 flex size-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
              <Icon className="size-6" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {t(`cards.${stat.key}.label`)}
            </p>

            <p className="mt-2 text-3xl font-extrabold text-primary">
              {stat.value}
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t(`cards.${stat.key}.description`)}
            </p>
          </article>
        );
      })}
    </section>
  );
}
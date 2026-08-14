"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock3 } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { applicationStatuses } from "@/constants/application-workflow";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";

type StudentStatusHeaderProps = {
  application: WorkflowApplication;
  locale: string;
};

export function StudentStatusHeader({
  application,
  locale,
}: StudentStatusHeaderProps) {
  const t = useTranslations("studentStatusWorkflow");
  const workflowT = useTranslations("admin.applicationWorkflow");

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.08)] md:p-8">
      <div className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -start-24 size-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <Clock3 className="size-4" />
            {t("badge")}
          </p>

          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {t("description")}
          </p>

          <p className="mt-4 text-sm font-bold text-secondary">
            {application.applicationNo}
          </p>
        </div>

        <div className="rounded-[22px] border border-primary/20 bg-primary/10 px-5 py-4">
          <p className="text-sm text-muted-foreground">{t("currentStatus")}</p>
          <p className="mt-1 text-lg font-extrabold text-primary">
            {workflowT(`statuses.${application.currentStatus}`)}
          </p>
        </div>
      </div>

      {application.currentStatus === applicationStatuses.paymentPending && (
        <Link
          href={withLocale(locale, routes.payment)}
          className="relative z-10 mt-6 inline-flex h-11 items-center justify-center rounded-[16px] bg-secondary px-5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
        >
          {t("payNow")}
        </Link>
      )}
    </section>
  );
}
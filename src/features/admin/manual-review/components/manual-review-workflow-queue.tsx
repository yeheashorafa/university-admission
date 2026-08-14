"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarDays,
  FileSearch,
  Percent,
  Search,
  User,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import type { WorkflowApplication } from "../../applications/data/applications-workflow.data";

type ManualReviewWorkflowQueueProps = {
  applications: WorkflowApplication[];
  search: string;
  onSearchChange: (value: string) => void;
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "");
}

export function ManualReviewWorkflowQueue({
  applications,
  search,
  onSearchChange,
}: ManualReviewWorkflowQueueProps) {
  const locale = useLocale();
  const t = useTranslations("admin.manualReview");
  const workflowT = useTranslations("admin.applicationWorkflow");

  const filteredApplications = useMemo(() => {
    const searchValue = normalizeSearchText(search);

    if (!searchValue) return applications;

    return applications.filter((application) => {
      const searchableText = normalizeSearchText(
        [
          application.applicationNo,
          application.studentName,
          application.nationalId,
          application.selectedProgram,
          application.faculty,
          application.average,
          application.currentStatus,
          workflowT(`statuses.${application.currentStatus}`),
        ].join(" ")
      );

      return searchableText.includes(searchValue);
    });
  }, [applications, search, workflowT]);

  return (
    <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold text-primary">
            {t("queueTitle")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("queueDescription")}
          </p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-12 w-full rounded-[16px] border border-input bg-background px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {filteredApplications.map((application) => (
          <ManualReviewApplicationCard
            key={application.id}
            application={application}
            locale={locale}
          />
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="rounded-[20px] border border-dashed border-border bg-muted/40 p-8 text-center">
          <p className="font-bold text-foreground">{t("emptyTitle")}</p>

          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </div>
      )}
    </section>
  );
}

type ManualReviewApplicationCardProps = {
  application: WorkflowApplication;
  locale: string;
};

function ManualReviewApplicationCard({
  application,
  locale,
}: ManualReviewApplicationCardProps) {
  const t = useTranslations("admin.manualReview");
  const workflowT = useTranslations("admin.applicationWorkflow");

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-border bg-background p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0px_14px_40px_rgba(118,188,33,0.10)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-secondary">
            {application.applicationNo}
          </p>

          <h3 className="mt-2 text-xl font-bold text-primary">
            {application.studentName}
          </h3>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {application.selectedProgram} · {application.faculty}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoItem
          icon={User}
          label={t("nationalId")}
          value={application.nationalId}
        />

        <InfoItem
          icon={Percent}
          label={t("average")}
          value={application.average}
        />



        <InfoItem
          icon={CalendarDays}
          label={t("createdAt")}
          value={application.createdAt}
        />
      </div>

      <div className="mt-5 rounded-[18px] border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{t("currentStatus")}</p>

        <p className="mt-1 font-bold text-primary">
          {workflowT(`statuses.${application.currentStatus}`)}
        </p>
      </div>



      <Link
        href={withLocale(locale, `${routes.adminApplications}/${application.id}`)}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        <FileSearch className="size-4" />
        {t("reviewApplication")}
      </Link>
    </article>
  );
}

type InfoItemProps = {
  icon: typeof User;
  label: string;
  value: string;
};

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="rounded-[16px] border border-border bg-card p-3">
      <div className="mb-2 flex size-9 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>

      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

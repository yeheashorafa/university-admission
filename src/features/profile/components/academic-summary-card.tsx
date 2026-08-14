"use client";

import { useLocale, useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import { useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";

export function AcademicSummaryCard() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: applications } = useStudentApplicationsQuery();
  const activeApp = applications?.[0];

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-primary">
        <GraduationCap className="size-6 text-secondary" />
        {t("academicSummary")}
      </h2>

      <div className="space-y-4">
        <InfoRow
          label={t("highSchoolAverage")}
          value={activeApp?.programName ? (isAr ? "مكتمل في الطلب" : "Attached to Application") : (isAr ? "غير متوفر" : "N/A")}
          strong
        />
        <InfoRow
          label={t("academicBranch")}
          value={activeApp?.facultyName || (isAr ? "غير متوفر" : "N/A")}
        />
        <InfoRow
          label={t("graduationYear")}
          value={activeApp?.submittedAt ? activeApp.submittedAt.split("-")[0] : (isAr ? "غير متوفر" : "N/A")}
        />
        <InfoRow
          label={t("school")}
          value={activeApp?.departmentName || (isAr ? "غير متوفر" : "N/A")}
        />
      </div>
    </section>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  strong?: boolean;
};

function InfoRow({ label, value, strong }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span
        className={
          strong
            ? "text-lg font-bold text-primary"
            : "font-semibold text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
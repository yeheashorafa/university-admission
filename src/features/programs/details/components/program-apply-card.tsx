"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Building2,
  GraduationCap,
  Info,
  Layers,
  Percent,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import type { ProgramViewModel } from "../../types";

type ProgramApplyCardProps = {
  program: ProgramViewModel;
};

export function ProgramApplyCard({ program }: ProgramApplyCardProps) {
  const locale = useLocale();
  const t = useTranslations("programsDetails");

  const safeBranches = Array.isArray(program?.branches)
    ? program.branches
    : typeof program?.branches === "string"
    ? [program.branches]
    : [];

  return (
    <section className="sticky top-28 rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-5 text-xl font-bold text-primary">
        {t("admissionSummary")}
      </h2>

      <div className="mb-6 space-y-4">
        {program.facultyName && (
          <SummaryItem
            icon={GraduationCap}
            label={t("faculty")}
            value={program.facultyName}
          />
        )}

        {program.departmentName && (
          <SummaryItem
            icon={Building2}
            label={t("department")}
            value={program.departmentName}
          />
        )}

        <SummaryItem
          icon={Percent}
          label={t("minimumRate")}
          value={`${program.minimumAverage}%`}
        />

        {safeBranches.length > 0 && (
          <SummaryItem
            icon={Layers}
            label={t("branches")}
            value={safeBranches.join(" / ")}
          />
        )}
      </div>

      <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" />

          <div>
            <p className="font-bold text-primary">
              {locale === "ar" ? "معلومات التقديم" : "Application Guidance"}
            </p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              {locale === "ar"
                ? "للتقديم، يرجى الدخول إلى حساب الطالب ثم الذهاب إلى طلباتي > طلب جديد."
                : "To apply, please log in to your student account and navigate to My Applications > New Application."}
            </p>
          </div>
        </div>
      </div>

      <Link
        href={withLocale(locale, routes.faculties)}
        className="flex h-12 w-full items-center justify-center rounded-lg border border-secondary text-sm font-bold text-secondary transition hover:bg-secondary/10"
      >
        {t("backToPrograms")}
      </Link>
    </section>
  );
}

type SummaryItemProps = {
  icon: React.ElementType;
  label: string;
  value: string;
};

function SummaryItem({ icon: Icon, label, value }: SummaryItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
        <Icon className="size-5" />
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
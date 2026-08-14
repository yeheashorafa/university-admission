"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpenCheck, Eye } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { ProgramViewModel } from "../types";

type ProgramCardProps = {
  program: ProgramViewModel;
  locale: string;
};

export function ProgramCard({ program, locale }: ProgramCardProps) {
  const t = useTranslations("programsPage");
  const detailsUrl = withLocale(locale, `${routes.programs}/${program.id}`);
  const safeBranches = Array.isArray(program?.branches) ? program.branches : [];

  return (
    <article className="flex h-full flex-col rounded-[24px] border border-border bg-background p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0px_14px_40px_rgba(118,188,33,0.10)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
          <BookOpenCheck className="size-6" />
        </div>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-bold",
            program.isActive
              ? "bg-secondary/10 text-secondary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          {program.isActive ? (locale === "ar" ? "متاح" : "Active") : (locale === "ar" ? "مغلق" : "Closed")}
        </span>
      </div>

      <h3 className="text-xl font-bold leading-8 text-primary">
        {program.name}
      </h3>

      {program.description && (
        <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
          {program.description}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        {program.degree && (
          <InfoBox label={t("degree")} value={program.degree} />
        )}

        {program.durationYears && (
          <InfoBox
            label={t("duration")}
            value={t("years", { count: program.durationYears })}
          />
        )}

        <InfoBox label={t("minAverage")} value={`${program.minimumAverage}%`} />

        {safeBranches.length > 0 && (
          <InfoBox
            label={t("branchesTitle")}
            value={safeBranches.join(" / ")}
          />
        )}
      </div>

      <Link
        href={detailsUrl}
        className={cn(
          "mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        )}
      >
        <Eye className="size-4" />
        {locale === "ar" ? "تفاصيل" : "View Details"}
      </Link>
    </article>
  );
}

type InfoBoxProps = {
  label: string;
  value: string;
};

function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <div className="rounded-[16px] border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
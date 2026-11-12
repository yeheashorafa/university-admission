"use client";

import { useLocale, useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import type { ProgramViewModel } from "../../types";

type ProgramDetailsHeroProps = {
  program: ProgramViewModel;
  nameAr?: string;
  nameEn?: string;
};

export function ProgramDetailsHero({ program, nameAr, nameEn }: ProgramDetailsHeroProps) {
  const isArabic = useLocale() === "ar";
  const alternateName = isArabic ? nameEn : nameAr;
  const t = useTranslations("programsDetails");

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-card p-8 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="pointer-events-none absolute -end-20 -top-20 size-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 max-w-4xl">
        {program.degree && (
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <GraduationCap className="size-5" />
            {program.degree} {t("program")}
          </div>
        )}

        <h1 className="text-3xl font-bold leading-tight text-primary md:text-5xl">
          <span lang={isArabic || !nameEn ? "ar" : "en"} dir="auto">{program.name}</span>
        </h1>

        {alternateName && alternateName !== program.name && (
          <p lang={isArabic ? "en" : "ar"} dir="auto" className="mt-2 text-lg text-muted-foreground">{alternateName}</p>
        )}

        {program.facultyName && (
          <p dir="auto" className="mt-4 text-lg font-medium text-secondary">
            {program.facultyName}
          </p>
        )}
      </div>
    </section>
  );
}
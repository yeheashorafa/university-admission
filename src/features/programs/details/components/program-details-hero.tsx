"use client";

import { useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";
import type { ProgramViewModel } from "../../types";

type ProgramDetailsHeroProps = {
  program: ProgramViewModel;
};

export function ProgramDetailsHero({ program }: ProgramDetailsHeroProps) {
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
          {program.name}
        </h1>

        {program.facultyName && (
          <p className="mt-4 text-lg font-medium text-secondary">
            {program.facultyName}
          </p>
        )}

        {program.description && (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            {program.description}
          </p>
        )}
      </div>
    </section>
  );
}
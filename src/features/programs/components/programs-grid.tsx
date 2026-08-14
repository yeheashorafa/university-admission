"use client";

import type { ProgramViewModel } from "../types";
import { ProgramCard } from "./program-card";

type ProgramsGridProps = {
  programs: ProgramViewModel[];
  locale: string;
};

export function ProgramsGrid({ programs, locale }: ProgramsGridProps) {
  const safePrograms = Array.isArray(programs) ? programs : [];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {safePrograms.map((program) => (
        <ProgramCard key={program.id} program={program} locale={locale} />
      ))}
    </div>
  );
}
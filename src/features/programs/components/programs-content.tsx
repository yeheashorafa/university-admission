"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type { FacultyViewModel, ProgramViewModel } from "../types";
import { ProgramsGrid } from "./programs-grid";

type ProgramsContentProps = {
  activeFaculty: FacultyViewModel | null;
  programs: ProgramViewModel[];
  departments?: unknown[];
  search: string;
  locale: string;
  onSearchChange: (value: string) => void;
};

export function ProgramsContent({
  activeFaculty,
  programs,
  departments,
  search,
  locale,
  onSearchChange,
}: ProgramsContentProps) {
  const t = useTranslations("programsPage");
  const safePrograms = Array.isArray(programs) ? programs : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-border bg-card p-5 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-bold text-secondary">
              {t("selectedFaculty")}
            </p>

            {activeFaculty && (
              <>
                <h2 className="text-2xl font-bold text-primary md:text-3xl">
                  {activeFaculty.name}
                </h2>

                {activeFaculty.description && (
                  <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
                    {activeFaculty.description}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="programSearch"
              name="programSearch"
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-[16px] border border-input bg-background px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <ProgramsGrid programs={safePrograms} locale={locale} />

        {safePrograms.length === 0 && safeDepartments.length === 0 && (
          <div className="mt-6 rounded-[20px] border border-dashed border-border bg-muted/40 p-8 text-center">
            <p className="font-bold text-foreground">{t("emptyTitle")}</p>

            <p className="mt-2 text-sm text-muted-foreground">
              {t("emptyDescription")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { routes, withLocale } from "@/constants/routes";
import { programOptions, type ProgramOption } from "../data/application.data";
import { ProgramOptionRow } from "./program-option-row";
import { SelectedPreferencesCard } from "./selected-preferences-card";

type ProgramPreferencesSectionProps = {
  children: React.ReactNode;
};

export function ProgramPreferencesSection({
  children,
}: ProgramPreferencesSectionProps) {
  const locale = useLocale();
  const t = useTranslations("application");
  const [search, setSearch] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState<ProgramOption[]>(
    programOptions.filter((program) =>
      ["computer-engineering", "medicine"].includes(program.id)
    )
  );

  const filteredPrograms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return programOptions;

    return programOptions.filter((program) =>
      t(`programOptions.${program.id}.title`).toLowerCase().includes(normalizedSearch)
    );
  }, [search, t]);

  function handleAddProgram(program: ProgramOption) {
    if (!program.eligible) return;

    const alreadySelected = selectedPrograms.some(
      (selected) => selected.id === program.id
    );

    if (alreadySelected || selectedPrograms.length >= 3) return;

    setSelectedPrograms((current) => [...current, program]);
  }

  function handleRemoveProgram(programId: string) {
    setSelectedPrograms((current) =>
      current.filter((program) => program.id !== programId)
    );
  }

  function handleMoveProgram(programId: string, direction: "up" | "down") {
    setSelectedPrograms((current) => {
      const index = current.findIndex((program) => program.id === programId);

      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const item = next[index];

      next[index] = next[targetIndex];
      next[targetIndex] = item;

      return next;
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-8">
          {children}

          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-primary">
                {t("selectPrograms")}
              </h2>

              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("searchProgramPlaceholder")}
                  className="h-11 w-full rounded-full border border-input bg-card px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid max-h-[420px] gap-3 overflow-y-auto pe-1">
              {filteredPrograms.map((program) => (
                <ProgramOptionRow
                  key={program.id}
                  program={program}
                  isSelected={selectedPrograms.some(
                    (selected) => selected.id === program.id
                  )}
                  onAdd={() => handleAddProgram(program)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4">
          <SelectedPreferencesCard
            selectedPrograms={selectedPrograms}
            onRemove={handleRemoveProgram}
            onMove={handleMoveProgram}
          />
        </aside>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={withLocale(locale, routes.dashboard)}
          className="inline-flex h-12 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          {t("back")}
        </Link>

        <Link
          href={withLocale(locale, routes.applicationSubmitted)}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          {t("submitApplication")}
        </Link>
      </div>
    </>
  );
}
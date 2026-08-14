"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

type AdmissionCyclesHeaderProps = {
  onCreateCycle: () => void;
};

export function AdmissionCyclesHeader({
  onCreateCycle,
}: AdmissionCyclesHeaderProps) {
  const t = useTranslations("admin");

  return (
    <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <p className="text-sm font-medium text-muted-foreground">
            {t("admissionCycles.admissionCalendar")}
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-extrabold text-amber-800 border border-amber-300">
            Demo / Pending Backend API
          </span>
        </div>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("admissionCycles.title")}
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {t("admissionCycles.description")}
        </p>
      </div>

      <button
        type="button"
        onClick={onCreateCycle}
        className="inline-flex h-12 w-max items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        <Plus className="size-5" />
        {t("admissionCycles.newCycle")}
      </button>
    </header>
  );
}
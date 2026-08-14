"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AdmissionCycle,
  AdmissionCycleStatus,
} from "../data/admission-cycles.data";

type AdmissionCyclesListProps = {
  cycles: AdmissionCycle[];
  activeCycleId: string;
  onSelectCycle: (cycleId: string) => void;
};

const statusConfig: Record<
  AdmissionCycleStatus,
  {
    labelKey: string;
    className: string;
  }
> = {
  open: {
    labelKey: "admissionCycles.status.open",
    className: "bg-primary/10 text-primary",
  },
  upcoming: {
    labelKey: "admissionCycles.status.upcoming",
    className: "bg-secondary/10 text-secondary",
  },
  closed: {
    labelKey: "admissionCycles.status.closed",
    className: "bg-destructive/10 text-destructive",
  },
  archived: {
    labelKey: "admissionCycles.status.archived",
    className: "bg-muted text-muted-foreground",
  },
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

export function AdmissionCyclesList({
  cycles,
  activeCycleId,
  onSelectCycle,
}: AdmissionCyclesListProps) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");

  const filteredCycles = useMemo(() => {
    const searchValue = normalizeSearchText(search);

    if (!searchValue) return cycles;

    return cycles.filter((cycle) => {
      const searchableText = normalizeSearchText(
        [
          cycle.name,
          cycle.academicYear,
          cycle.semester,
          cycle.status,
          cycle.applicationsOpenAt,
          cycle.applicationsCloseAt,
          cycle.paymentDeadline,
          cycle.notes,
        ].join(" ")
      );

      return searchableText.includes(searchValue);
    });
  }, [cycles, search]);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-primary">
          {t("admissionCycles.cyclesList")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("admissionCycles.cyclesListDescription")}
        </p>
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("admissionCycles.searchPlaceholder")}
          className="h-11 w-full rounded-lg border border-input bg-card px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredCycles.length > 0 ? (
          filteredCycles.map((cycle) => {
            const status = statusConfig[cycle.status];
            const isActive = cycle.id === activeCycleId;

            return (
              <button
                key={cycle.id}
                type="button"
                onClick={() => onSelectCycle(cycle.id)}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg border p-4 text-start transition hover:bg-muted",
                  isActive
                    ? "border-secondary bg-secondary/10"
                    : "border-border bg-card"
                )}
              >
                {isActive && (
                  <div className="absolute inset-y-0 start-0 w-1 bg-primary" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CalendarDays className="size-5" />
                    </div>

                    <div>
                      <p className="font-bold text-foreground">
                        {cycle.name}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {cycle.academicYear} ·{" "}
                        {t(`admissionCycles.semesters.${cycle.semester}`)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-1 text-xs font-bold",
                      status.className
                    )}
                  >
                    {t(status.labelKey)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <span>
                    {t("admissionCycles.apps")}: {cycle.applicationsCount}
                  </span>
                  <span>
                    {t("admissionCycles.capacity")}: {cycle.capacity}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            {t("admissionCycles.noResultsDescription")}
          </div>
        )}
      </div>
    </section>
  );
}
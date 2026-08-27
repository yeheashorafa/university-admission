"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, Filter } from "lucide-react";
import { AdminCustomSelect } from "@/components/ui/admin-custom-select";
export function ReportsFilterBar({
  onApply,
}: {
  onApply?: (range: { from?: string; to?: string }) => void;
}) {
  const t = useTranslations("admin");

  const [cycle, setCycle] = useState("all");
  const [faculty, setFaculty] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  function handleApply() {
    onApply?.({
      from: fromDate ? fromDate : undefined,
      to: toDate ? toDate : undefined,
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-3">
          <AdminCustomSelect
            id="cycle"
            label={t("reports.admissionCycle")}
            value={cycle}
            onChange={setCycle}
            options={[
              {
                label: t("reports.allCycles"),
                value: "all",
              },
              {
                label: "Fall 2026",
                value: "fall-2026",
              },
              {
                label: "Spring 2027",
                value: "spring-2027",
              },
              {
                label: "Fall 2025",
                value: "fall-2025",
              },
            ]}
          />
        </div>

        <div className="lg:col-span-3">
          <AdminCustomSelect
            id="faculty"
            label={t("reports.faculty")}
            value={faculty}
            onChange={setFaculty}
            options={[
              {
                label: t("reports.allFaculties"),
                value: "all",
              },
              {
                label: t("reports.faculties.informationTechnology"),
                value: "it",
              },
              {
                label: t("reports.faculties.medicine"),
                value: "medicine",
              },
              {
                label: t("reports.faculties.engineering"),
                value: "engineering",
              },
              {
                label: t("reports.faculties.commerce"),
                value: "commerce",
              },
              {
                label: t("reports.faculties.arts"),
                value: "arts",
              },
            ]}
          />
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="from-date"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("reports.from")}
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 ps-10 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="to-date"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("reports.to")}
          </label>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 ps-10 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-5 text-sm font-bold text-foreground transition hover:bg-muted/70 lg:col-span-2"
        >
          <Filter className="size-5" />
          {t("reports.applyFilters")}
        </button>
      </div>
    </section>
  );
}

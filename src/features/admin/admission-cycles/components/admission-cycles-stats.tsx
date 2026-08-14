"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck2, CalendarPlus, ClipboardList, Users } from "lucide-react";
import type { AdmissionCycle } from "../data/admission-cycles.data";

const icons = [CalendarCheck2, CalendarPlus, ClipboardList, Users];

type AdmissionCyclesStatsProps = {
  cycles: AdmissionCycle[];
};

export function AdmissionCyclesStats({ cycles }: AdmissionCyclesStatsProps) {
  const t = useTranslations("admin");

  const stats = useMemo(() => {
    const openCycles = cycles.filter((cycle) => cycle.status === "open").length;
    const upcomingCycles = cycles.filter(
      (cycle) => cycle.status === "upcoming"
    ).length;

    const totalApplications = cycles.reduce(
      (sum, cycle) => sum + cycle.applicationsCount,
      0
    );

    const currentCapacity =
      cycles.find((cycle) => cycle.status === "open")?.capacity ?? 0;

    return [
      {
        key: "activeCycle",
        value: openCycles.toLocaleString(),
      },
      {
        key: "upcomingCycles",
        value: upcomingCycles.toLocaleString(),
      },
      {
        key: "totalApplications",
        value: totalApplications.toLocaleString(),
      },
      {
        key: "currentCapacity",
        value: currentCapacity.toLocaleString(),
      },
    ];
  }, [cycles]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index];

        return (
          <article
            key={stat.key}
            className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]"
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-6" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {t(`admissionCycles.stats.${stat.key}`)}
            </p>

            <p className="mt-1 text-3xl font-bold text-primary">
              {stat.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
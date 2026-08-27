"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Building2, CheckCircle2, LockKeyhole } from "lucide-react";
import type { Faculty } from "../data/faculties.data";

const icons = [Building2, CheckCircle2, LockKeyhole];

type FacultiesStatsProps = {
  faculties: Faculty[];
};

export function FacultiesStats({ faculties }: FacultiesStatsProps) {
  const t = useTranslations("admin");

  const stats = useMemo(() => {
    const total = faculties.length;
    const active = faculties.filter((faculty) => faculty.is_active).length;
    const inactive = faculties.filter((faculty) => !faculty.is_active).length;

    return [
      { key: "total", value: total.toLocaleString() },
      { key: "active", value: active.toLocaleString() },
      { key: "inactive", value: inactive.toLocaleString() },
    ];
  }, [faculties]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              {t(`faculties.stats.${stat.key}`)}
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

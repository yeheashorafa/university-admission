"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, FileSpreadsheet, LockKeyhole } from "lucide-react";
import type { ApplicationType } from "../data/application-types.data";

const icons = [FileSpreadsheet, CheckCircle2, LockKeyhole];

type ApplicationTypesStatsProps = {
  applicationTypes: ApplicationType[];
};

export function ApplicationTypesStats({
  applicationTypes,
}: ApplicationTypesStatsProps) {
  const t = useTranslations("admin");

  const stats = useMemo(() => {
    const total = applicationTypes.length;
    const active = applicationTypes.filter(
      (item) => item.is_active
    ).length;
    const inactive = applicationTypes.filter(
      (item) => !item.is_active
    ).length;

    return [
      { key: "total", value: total.toLocaleString() },
      { key: "active", value: active.toLocaleString() },
      { key: "inactive", value: inactive.toLocaleString() },
    ];
  }, [applicationTypes]);

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
              {t(`applicationTypes.stats.${stat.key}`)}
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

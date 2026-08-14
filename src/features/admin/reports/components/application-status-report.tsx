"use client";

import { useTranslations } from "next-intl";
import type { ReportsChartItem } from "../utils/admin-reports-analytics";

type ApplicationStatusReportProps = {
  data: ReportsChartItem[];
};

export function ApplicationStatusReport({ data }: ApplicationStatusReportProps) {
  const t = useTranslations("reports");

  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-bold text-primary">
          {t("statusChart.title")}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {t("statusChart.description")}
        </p>
      </div>

      <div className="space-y-5">
        {data.map((item) => {
          const percentage = Math.round((item.value / maxValue) * 100);

          return (
            <div key={item.key}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">
                    {t(`statusChart.${item.key}`)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {item.value} {t("applications")}
                  </p>
                </div>

                <span className="font-bold text-primary">
                  {percentage}%
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
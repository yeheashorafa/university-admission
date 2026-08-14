"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import type { ReportsChartItem } from "../utils/admin-reports-analytics";

type AiAlertsReportProps = {
  data: ReportsChartItem[];
};

export function AiAlertsReport({ data }: AiAlertsReportProps) {
  const t = useTranslations("reports");

  const maxValue = Math.max(1, ...data.map((item) => item.value));

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-primary">
        <AlertTriangle className="size-6 text-secondary" />
        {t("aiChart.title")}
      </h2>

      <p className="mb-5 text-sm leading-6 text-muted-foreground">
        {t("aiChart.description")}
      </p>

      <div className="space-y-4">
        {data.map((item) => {
          const percentage = Math.round((item.value / maxValue) * 100);

          return (
            <div key={item.key} className="rounded-[18px] border border-border bg-muted p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-bold text-foreground">
                  {t(`aiChart.${item.key}`)}
                </p>

                <span className="text-sm font-bold text-primary">
                  {item.value}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-border">
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
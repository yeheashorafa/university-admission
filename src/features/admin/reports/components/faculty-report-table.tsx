"use client";

import { useTranslations } from "next-intl";
import type { ReportsChartItem } from "../utils/admin-reports-analytics";

type FacultyReportTableProps = {
  data: ReportsChartItem[];
};

export function FacultyReportTable({ data }: FacultyReportTableProps) {
  const t = useTranslations("reports");

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="border-b border-border bg-muted/60 px-5 py-4">
        <h2 className="text-xl font-bold text-primary">
          {t("facultyChart.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("facultyChart.description")}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-start">
          <thead className="border-b border-border bg-card text-sm text-muted-foreground">
            <tr>
              <th className="px-5 py-4 text-start font-semibold">
                {t("table.faculty")}
              </th>
              <th className="px-5 py-4 text-center font-semibold">
                {t("table.applications")}
              </th>
              <th className="px-5 py-4 text-center font-semibold">
                {t("table.percentage")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {data.map((faculty) => {
              const percentage =
                total === 0 ? 0 : Math.round((faculty.value / total) * 100);

              return (
                <tr key={faculty.key} className="transition hover:bg-muted/60">
                  <td className="px-5 py-4">
                    <p className="font-bold text-foreground">
                      {faculty.label ?? faculty.key}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-center font-semibold text-primary">
                    {faculty.value}
                  </td>

                  <td className="px-5 py-4">
                    <div className="mx-auto max-w-[160px]">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t("table.percentage")}
                        </span>

                        <span className="font-bold text-primary">
                          {percentage}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-secondary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
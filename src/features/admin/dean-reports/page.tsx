"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { ReportsFilterBar } from "@/features/admin/reports/components/reports-filter-bar";
import {
  BarRowList,
  ErrorState,
  LoadingState,
  ReportPanel,
  ReportTable,
} from "@/features/admin/reports/components/report-display";
import { useDeanReportsQuery } from "@/hooks/queries/use-dean-reports-queries";

type DeanReportTab =
  | "byStatus"
  | "byFaculty"
  | "byDepartment"
  | "byProgram"
  | "timeInStatus"
  | "uploadVolume"
  | "acceptanceRate";

const DEAN_TABS: { key: DeanReportTab; label: string }[] = [
  { key: "byStatus", label: "By Status" },
  { key: "byFaculty", label: "By Faculty" },
  { key: "byDepartment", label: "By Department" },
  { key: "byProgram", label: "By Program" },
  { key: "timeInStatus", label: "Time in Status" },
  { key: "uploadVolume", label: "Upload Volume" },
  { key: "acceptanceRate", label: "Acceptance Rate" },
];

export function DeanReportsPage() {
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [active, setActive] = useState<DeanReportTab>("byStatus");

  const { data, isLoading, isError } = useDeanReportsQuery(range);

  return (
    <AdminLayout activePath={routes.adminDeanReports}>
      <div className="flex flex-col gap-8">
        <header className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-primary">Dean Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            System-wide admission statistics scoped by date range.
          </p>
        </header>

        <ReportsFilterBar onApply={(nextRange) => setRange(nextRange)} />

        <div className="flex flex-wrap gap-3">
          {DEAN_TABS.map((tab) => {
            const isActive = tab.key === active;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={
                  isActive
                    ? "rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                    : "rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground transition hover:bg-muted/40"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <ReportPanel title="Report">
            <LoadingState />
          </ReportPanel>
        ) : isError ? (
          <ReportPanel title="Report">
            <ErrorState />
          </ReportPanel>
        ) : (
          renderActiveReport(active, data)
        )}
      </div>
    </AdminLayout>
  );
}

function renderActiveReport(active: DeanReportTab, data: ReturnType<typeof useDeanReportsQuery>["data"]) {
  switch (active) {
    case "byStatus":
      return (
        <ReportPanel title="Applications by Status">
          <BarRowList items={data?.byStatus ?? []} />
        </ReportPanel>
      );

    case "byFaculty":
      return (
        <ReportPanel title="Applications by Faculty">
          <BarRowList items={data?.byFaculty ?? []} />
        </ReportPanel>
      );

    case "byDepartment":
      return (
        <ReportPanel title="Applications by Department">
          <BarRowList items={data?.byDepartment ?? []} />
        </ReportPanel>
      );

    case "byProgram":
      return (
        <ReportPanel title="Applications by Program">
          <BarRowList items={data?.byProgram ?? []} />
        </ReportPanel>
      );

    case "timeInStatus":
      return (
        <ReportPanel title="Time in Status">
          <ReportTable
            columns={[
              { key: "label", label: "Status" },
              { key: "average_seconds", label: "Avg (s)" },
              { key: "average_minutes", label: "Avg (min)" },
            ]}
            rows={data?.timeInStatus ?? []}
          />
        </ReportPanel>
      );

    case "uploadVolume":
      return (
        <ReportPanel title="Document Upload Volume" description="Uploads grouped by day.">
          <ReportTable
            columns={[
              { key: "date", label: "Date" },
              { key: "count", label: "Count" },
            ]}
            rows={data?.uploadVolume ?? []}
          />
        </ReportPanel>
      );

    case "acceptanceRate":
      return (
        <ReportPanel title="Acceptance Rate by Program">
          <ReportTable
            columns={[
              { key: "label", label: "Program" },
              { key: "accepted", label: "Accepted" },
              { key: "rejected", label: "Rejected" },
              { key: "total", label: "Total" },
              { key: "rate", label: "Rate (%)" },
            ]}
            rows={data?.acceptanceRate ?? []}
          />
        </ReportPanel>
      );

    default:
      return null;
  }
}

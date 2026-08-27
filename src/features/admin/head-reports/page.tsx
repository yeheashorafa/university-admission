"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { ReportsFilterBar } from "@/features/admin/reports/components/reports-filter-bar";
import {
  BarRowList,
  ErrorState,
  KeyValueList,
  LoadingState,
  ReportPanel,
  ReportTable,
} from "@/features/admin/reports/components/report-display";
import { useHeadReportsQuery } from "@/hooks/queries/use-head-reports-queries";

type HeadReportTab =
  | "byStatus"
  | "throughput"
  | "timeToDecision"
  | "acceptanceRate";

const HEAD_TABS: { key: HeadReportTab; label: string }[] = [
  { key: "byStatus", label: "By Status" },
  { key: "throughput", label: "Throughput" },
  { key: "timeToDecision", label: "Time to Decision" },
  { key: "acceptanceRate", label: "Acceptance Rate" },
];

export function HeadReportsPage() {
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [active, setActive] = useState<HeadReportTab>("byStatus");

  const { data, isLoading, isError } = useHeadReportsQuery(range);

  return (
    <AdminLayout activePath={routes.adminHeadReports}>
      <div className="flex flex-col gap-8">
        <header className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-primary">Department Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Applications assigned to your department, scoped by date range.
          </p>
        </header>

        <ReportsFilterBar onApply={(nextRange) => setRange(nextRange)} />

        <div className="flex flex-wrap gap-3">
          {HEAD_TABS.map((tab) => {
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

function renderActiveReport(active: HeadReportTab, data: ReturnType<typeof useHeadReportsQuery>["data"]) {
  switch (active) {
    case "byStatus":
      return (
        <ReportPanel title="Applications by Status">
          <BarRowList items={data?.byStatus ?? []} />
        </ReportPanel>
      );

    case "throughput":
      return (
        <ReportPanel title="Decision Throughput" description="Decisions grouped by day.">
          <ReportTable
            columns={[
              { key: "date", label: "Date" },
              { key: "count", label: "Count" },
            ]}
            rows={data?.throughput ?? []}
          />
        </ReportPanel>
      );

    case "timeToDecision":
      return (
        <ReportPanel title="Time to Decision">
          <KeyValueList
            items={(data?.timeToDecision ?? []).map((item) => ({
              label: item.label,
              value: item.value,
            }))}
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

"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  exportAcceptanceRateReport,
  type AcceptanceRateReport,
  type ReportDateRange,
} from "@/services/admin-reports.service";

export function AcceptanceRateTile({
  audience,
  range,
  report,
}: {
  audience: "admin" | "admissionDean";
  range: ReportDateRange;
  report?: AcceptanceRateReport | null;
}) {
  const t = useTranslations("admin.reports.acceptanceTile");
  const format = useFormatter();
  const [exporting, setExporting] = useState(false);
  const totals = report?.rows.reduce(
    (sum, row) => ({
      accepted: sum.accepted + (row.numerator ?? row.accepted),
      decided: sum.decided + (row.denominator ?? (row.accepted + row.rejected)),
    }),
    { accepted: 0, decided: 0 }
  );
  const snapshot = report?.snapshot;
  const generatedAt = snapshot ? new Date(snapshot.generatedAt) : null;

  async function handleExport() {
    setExporting(true);
    try {
      const { blob, filename } = await exportAcceptanceRateReport(audience, range);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      try {
        link.click();
      } finally {
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      toast.error(t("exportFailed"));
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">{t("title")}</h2>
        <p className="mt-1 text-2xl font-bold text-primary">
          {totals?.decided
            ? format.number(totals.accepted / totals.decided, { style: "percent", maximumFractionDigits: 1 })
            : t("unavailable")}
        </p>
        {snapshot && generatedAt && Number.isFinite(generatedAt.getTime()) && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t("snapshot", {
              from: snapshot.periodStart,
              to: snapshot.periodEnd,
              generatedAt: format.dateTime(generatedAt, { dateStyle: "medium", timeStyle: "short" }),
            })}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={exporting}
        onClick={handleExport}
        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
      >
        <Download className="size-4" aria-hidden="true" />
        {t(exporting ? "exporting" : "export")}
      </button>
    </section>
  );
}

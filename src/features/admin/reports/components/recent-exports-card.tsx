"use client";

import { useTranslations } from "next-intl";
import { Download, FileText } from "lucide-react";
import { recentReportExportsMock } from "../data/admin-reports.data";

export function RecentExportsCard() {
  const t = useTranslations("admin");

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-5 text-xl font-bold text-primary">
        {t("reports.recentExports")}
      </h2>

      <div className="space-y-3">
        {recentReportExportsMock.map((report) => (
          <article
            key={report.id}
            className="rounded-lg border border-border bg-muted p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">
                  {t(`reports.exports.${report.id}.name`)}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {report.format} · {t(`reports.exports.${report.id}.generatedAt`)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {t("reports.by")} {t(`reports.exports.${report.id}.generatedBy`)}
                </p>
              </div>

              <button
                type="button"
                title={t("reports.downloadReport")}
                className="rounded-lg p-2 text-secondary transition hover:bg-secondary/10"
              >
                <Download className="size-5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
"use client";

import { useTranslations } from "next-intl";
import { ClipboardCheck } from "lucide-react";

export function SubmittedApplicationSummary() {
  const t = useTranslations("applicationSubmitted");

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-primary">
        <ClipboardCheck className="size-6 text-secondary" />
        {t("summary.title")}
      </h2>

      {/* PENDING_BACKEND_API: application summary data not yet available */}
      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-mono text-amber-700 dark:text-amber-300">
        PENDING_BACKEND_API — بيانات الطلب المؤكدة غير متاحة بعد من الخادم
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SummaryBox label={t("summary.applicationNo")} value="—" highlight />
        <SummaryBox label={t("summary.submittedAt")} value="—" />
        <SummaryBox label={t("summary.program")} value="—" />
        <SummaryBox label={t("summary.faculty")} value="—" />
        <SummaryBox
          label={t("summary.currentStatus")}
          value={t("status.underReview")}
          highlight
        />
      </div>
    </section>
  );
}

type SummaryBoxProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function SummaryBox({ label, value, highlight }: SummaryBoxProps) {
  return (
    <div className="rounded-xl border border-border bg-muted p-4">
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>

      <p
        className={
          highlight
            ? "text-lg font-bold text-primary"
            : "font-semibold text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}
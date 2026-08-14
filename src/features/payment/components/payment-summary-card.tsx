"use client";

import { useTranslations } from "next-intl";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";
import { paymentMock } from "../data/payment.data";

type Props = {
  application?: WorkflowApplication;
};

export function PaymentSummaryCard({ application }: Props) {
  const t = useTranslations("payment");

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-5 text-xl font-bold text-primary">
        {t("paymentSummary")}
      </h2>

      <div className="mb-5 space-y-4">
        <SummaryRow label={t("student")} value={application?.studentName ?? t("mockStudentName")} />
        <SummaryRow label={t("application")} value={application?.applicationNo ?? paymentMock.applicationNo} />
        <SummaryRow label={t("program")} value={application?.selectedProgram ?? t("mockProgram")} />
        <SummaryRow label={t("faculty")} value={application?.faculty ?? t("mockFaculty")} />
      </div>

      <div className="border-t border-border pt-5">
        <div className="space-y-3">
          {paymentMock.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">
                  {t(`items.${item.id}.title`)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(`items.${item.id}.description`)}
                </p>
              </div>

              <span className="font-bold text-foreground">
                ${item.amount}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
          <span className="text-lg font-bold text-primary">
            {t("total")}
          </span>
          <span className="text-3xl font-bold text-primary">
            ${paymentMock.invoice.total}
          </span>
        </div>
      </div>
    </section>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
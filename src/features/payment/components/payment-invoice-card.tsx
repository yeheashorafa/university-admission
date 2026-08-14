"use client";

import { useTranslations } from "next-intl";
import { Download, FileText } from "lucide-react";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";
import { paymentMock } from "../data/payment.data";

type Props = {
  application?: WorkflowApplication;
};

export function PaymentInvoiceCard({ application }: Props) {
  const t = useTranslations("payment");
  const invoice = paymentMock.invoice;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-primary">
        <FileText className="size-6 text-secondary" />
        {t("invoice")}
      </h2>

      <div className="space-y-4">
        <InvoiceRow
          label={t("invoiceNo")}
          value={application ? `INV-${application.applicationNo.replace("APP-", "")}` : invoice.invoiceNo}
        />
        <InvoiceRow label={t("issueDate")} value={application?.createdAt ?? t("mockIssueDate")} />
        <InvoiceRow label={t("dueDate")} value={t("mockDueDate")} />
        <InvoiceRow
          label={t("status")}
          value={
            application?.paymentReference
              ? t("paymentCompleted")
              : application?.currentStatus === "payment_failed"
              ? t("paymentFailed")
              : t("pending")
          }
        />
      </div>

      <button
        type="button"
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-secondary text-sm font-bold text-secondary transition hover:bg-secondary/10"
      >
        <Download className="size-5" />
        {t("downloadInvoice")}
      </button>
    </section>
  );
}

type InvoiceRowProps = {
  label: string;
  value: string;
};

function InvoiceRow({ label, value }: InvoiceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
"use client";

import { useTranslations } from "next-intl";
import {
  CircleDollarSign,
  FileText,
  GraduationCap,
  IdCard,
} from "lucide-react";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";

type PaymentResultSummaryCardProps = {
  application: WorkflowApplication;
};

export function PaymentResultSummaryCard({
  application,
}: PaymentResultSummaryCardProps) {
  const t = useTranslations("payment");

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <h2 className="text-xl font-bold text-primary">{t("summaryTitle")}</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SummaryItem
          icon={FileText}
          label={t("applicationNo")}
          value={application.applicationNo}
        />

        <SummaryItem
          icon={GraduationCap}
          label={t("program")}
          value={application.selectedProgram}
        />

        <SummaryItem
          icon={CircleDollarSign}
          label={t("paymentReference")}
          value={application.paymentReference ?? t("notAvailable")}
        />

        <SummaryItem
          icon={IdCard}
          label={t("universityNumber")}
          value={application.universityNumber ?? t("notIssuedYet")}
        />
      </div>
    </section>
  );
}

type SummaryItemProps = {
  icon: typeof FileText;
  label: string;
  value: string;
};

function SummaryItem({ icon: Icon, label, value }: SummaryItemProps) {
  return (
    <div className="rounded-[18px] border border-border bg-background p-4">
      <div className="mb-3 flex size-10 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>

      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}
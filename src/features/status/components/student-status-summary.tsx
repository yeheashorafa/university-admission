"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, FileText, GraduationCap, IdCard } from "lucide-react";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";
import { ApplicationSummaryCard } from "./application-summary-card";

type StudentStatusSummaryProps = {
  application: WorkflowApplication;
};

export function StudentStatusSummary({
  application,
}: StudentStatusSummaryProps) {
  const t = useTranslations("studentStatusWorkflow");

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ApplicationSummaryCard
        icon={GraduationCap}
        label={t("program")}
        value={application.selectedProgram}     
      />

      <ApplicationSummaryCard
        icon={FileText}
        label={t("faculty")}
        value={application.faculty}
      />

      <ApplicationSummaryCard
        icon={CheckCircle2}
        label={t("average")}
        value={application.average}
      />

      <ApplicationSummaryCard
        icon={IdCard}
        label={t("universityNumber")}
        value={application.universityNumber ?? t("notIssuedYet")}
      />
    </section>
  );
}
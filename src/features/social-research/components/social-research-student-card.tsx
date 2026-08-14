"use client";

import { useTranslations } from "next-intl";
import { FileText, GraduationCap, IdCard, User } from "lucide-react";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";

type SocialResearchStudentCardProps = {
  application: WorkflowApplication;
};

export function SocialResearchStudentCard({
  application,
}: SocialResearchStudentCardProps) {
  const t = useTranslations("socialResearch");

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <h2 className="text-xl font-bold text-primary">
        {t("studentInfoTitle")}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoItem
          icon={User}
          label={t("studentName")}
          value={application.studentName}
        />

        <InfoItem
          icon={FileText}
          label={t("applicationNo")}
          value={application.applicationNo}
        />

        <InfoItem
          icon={GraduationCap}
          label={t("program")}
          value={application.selectedProgram}
        />

        <InfoItem
          icon={IdCard}
          label={t("universityNumber")}
          value={application.universityNumber ?? t("notIssuedYet")}
        />
      </div>
    </section>
  );
}

type InfoItemProps = {
  icon: typeof User;
  label: string;
  value: string;
};

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
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
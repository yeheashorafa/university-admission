"use client";

import { useTranslations } from "next-intl";
import { ClipboardCheck, UserCheck } from "lucide-react";
import { userRoles } from "@/constants/roles";

type ManualReviewHeaderProps = {
  totalApplications: number;
  role?: string | null;
};

export function ManualReviewHeader({
  totalApplications,
  role,
}: ManualReviewHeaderProps) {
  const t = useTranslations("admin.manualReview");

  const isDepartmentHead = role === userRoles.departmentHead;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.08)] md:p-8">
      <div className="pointer-events-none absolute -end-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -start-20 size-64 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            {isDepartmentHead ? (
              <UserCheck className="size-4" />
            ) : (
              <ClipboardCheck className="size-4" />
            )}

            {isDepartmentHead ? t("headBadge") : t("employeeBadge")}
          </p>

          <h1 className="text-3xl font-bold text-primary">
            {isDepartmentHead ? t("headTitle") : t("employeeTitle")}
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {isDepartmentHead
              ? t("headDescription")
              : t("employeeDescription")}
          </p>
        </div>

        <div className="rounded-[22px] border border-primary/20 bg-primary/10 px-5 py-4 text-center">
          <p className="text-sm text-muted-foreground">{t("pendingCases")}</p>

          <p className="mt-1 text-3xl font-extrabold text-primary">
            {totalApplications}
          </p>
        </div>
      </div>
    </section>
  );
}
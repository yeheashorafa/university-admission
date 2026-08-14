"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Eye, FileSearch, Search } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  applicationStatuses,
  type ApplicationStatus,
} from "@/constants/application-workflow";
import type { WorkflowApplication } from "../data/applications-workflow.data";

type ApplicationsWorkflowTableProps = {
  applications: WorkflowApplication[];
  search: string;
  onSearchChange: (value: string) => void;
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "");
}

export function ApplicationsWorkflowTable({
  applications,
  search,
  onSearchChange,
}: ApplicationsWorkflowTableProps) {
  const locale = useLocale();
  const t = useTranslations("admin.applications");
  const workflowT = useTranslations("admin.applicationWorkflow");

  const filteredApplications = useMemo(() => {
    const searchValue = normalizeSearchText(search);

    if (!searchValue) return applications;

    return applications.filter((application) => {
      const searchableText = normalizeSearchText(
        [
          application.applicationNo,
          application.studentName,
          application.nationalId,
          application.selectedProgram,
          application.faculty,
          application.average,
          application.currentStatus,
          workflowT(`statuses.${application.currentStatus}`),
        ].join(" "),
      );

      return searchableText.includes(searchValue);
    });
  }, [applications, search, workflowT]);

  return (
    <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-bold text-primary">{t("tableTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("tableDescription")}
          </p>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-12 w-full rounded-[16px] border border-input bg-background px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-start">
            <thead className="bg-muted/60">
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="px-4 py-4 text-start font-bold">
                  {t("application")}
                </th>
                <th className="px-4 py-4 text-start font-bold">
                  {t("student")}
                </th>
                <th className="px-4 py-4 text-start font-bold">
                  {t("program")}
                </th>
                <th className="px-4 py-4 text-start font-bold">
                  {t("average")}
                </th>

                <th className="px-4 py-4 text-start font-bold">
                  {t("status")}
                </th>
                <th className="px-4 py-4 text-start font-bold">
                  {t("actions")}
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/40"
                >

                  <td className="px-4 py-4">
                    <p className="font-bold text-foreground">
                      {application.applicationNo}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.createdAt}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-bold text-foreground">
                      {application.studentName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.nationalId}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-bold text-foreground">
                      {application.selectedProgram}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.faculty}
                    </p>
                  </td>

                  <td className="px-4 py-4 font-bold text-foreground">
                    {application.average}
                  </td>



                  <td className="px-4 py-4">
                    <StatusBadge status={application.currentStatus} />
                  </td>

                  <td className="flex flex-col px-4 py-4 gap-3">
                    <Link
                      href={withLocale(
                        locale,
                        `${routes.adminApplications}/${application.id}`,
                      )}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                      <Eye className="size-4" />
                      {t("view")}
                    </Link>
                    <Link
                      href={withLocale(
                        locale,
                        `${routes.adminDocumentVerification}/${application.id}`,
                      )}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-xs font-bold text-primary transition hover:bg-primary/10"
                    >
                      <FileSearch className="size-4" />
                      {t("viewAiResult")}
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredApplications.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {t("emptyDescription")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

type StatusBadgeProps = {
  status: ApplicationStatus;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const workflowT = useTranslations("admin.applicationWorkflow");

  const rejectedStatuses: ApplicationStatus[] = [
    applicationStatuses.aiRejected,
    applicationStatuses.employeeRejected,
    applicationStatuses.headRejected,
  ];

  const successStatuses: ApplicationStatus[] = [
    applicationStatuses.headApproved,
    applicationStatuses.paymentCompleted,
    applicationStatuses.universityNumberIssued,
    applicationStatuses.completed,
  ];

  const warningStatuses: ApplicationStatus[] = [
    applicationStatuses.aiFailed,
    applicationStatuses.employeeReview,
    applicationStatuses.employeeApproved,
    applicationStatuses.headReview,
    applicationStatuses.paymentPending,
    applicationStatuses.socialResearchRequired,
  ];

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold",
        rejectedStatuses.includes(status) &&
          "bg-destructive/10 text-destructive",
        successStatuses.includes(status) && "bg-secondary/10 text-secondary",
        warningStatuses.includes(status) && "bg-primary/10 text-primary",
      )}
    >
      {workflowT(`statuses.${status}`)}
    </span>
  );
}

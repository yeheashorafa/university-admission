"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  applicationStatuses,
  type ApplicationStatus,
} from "@/constants/application-workflow";

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const workflowT = useTranslations("admin.applicationWorkflow");

  const rejectedStatuses: string[] = [
    applicationStatuses.aiRejected,
    applicationStatuses.employeeRejected,
    applicationStatuses.headRejected,
    "rejected",
    "cancelled",
  ];

  const successStatuses: string[] = [
    applicationStatuses.headApproved,
    applicationStatuses.paymentCompleted,
    applicationStatuses.universityNumberIssued,
    applicationStatuses.completed,
    "accepted",
    "approved",
  ];

  const warningStatuses: string[] = [
    applicationStatuses.aiFailed,
    applicationStatuses.employeeReview,
    applicationStatuses.employeeApproved,
    applicationStatuses.headReview,
    applicationStatuses.paymentPending,
    applicationStatuses.socialResearchRequired,
    "under_review",
    "forwarded_to_department_head",
    "returned_to_employee",
    "returned_for_revision",
  ];

  const normalizedStatus = status as ApplicationStatus;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold",
        rejectedStatuses.includes(status) &&
          "bg-destructive/10 text-destructive",
        successStatuses.includes(status) && "bg-secondary/10 text-secondary",
        warningStatuses.includes(status) && "bg-primary/10 text-primary"
      )}
    >
      {workflowT(`statuses.${normalizedStatus}`) || status}
    </span>
  );
}

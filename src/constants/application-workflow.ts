export const applicationStatuses = {
  draft: "draft",
  submitted: "submitted",
  aiReview: "ai_review",
  aiApproved: "ai_approved",
  aiRejected: "ai_rejected",
  aiFailed: "ai_failed",

  employeeReview: "employee_review",
  employeeApproved: "employee_approved",
  employeeRejected: "employee_rejected",
  missingDocuments: "missing_documents",

  headReview: "head_review",
  headApproved: "head_approved",
  headRejected: "head_rejected",

  paymentPending: "payment_pending",
  paymentCompleted: "payment_completed",
  paymentFailed: "payment_failed",

  universityNumberIssued: "university_number_issued",
  socialResearchRequired: "social_research_required",
  socialResearchSubmitted: "social_research_submitted",

  completed: "completed",
} as const;

export type ApplicationStatus =
  | (typeof applicationStatuses)[keyof typeof applicationStatuses]
  | "under_review"
  | "returned_for_revision"
  | "forwarded_to_department_head"
  | "returned_to_employee"
  | "accepted"
  | "rejected"
  | "cancelled";

export const applicationStatusFlow: ApplicationStatus[] = [
  applicationStatuses.submitted,
  applicationStatuses.aiReview,
  applicationStatuses.aiFailed,
  applicationStatuses.employeeReview,
  applicationStatuses.employeeApproved,
  applicationStatuses.headReview,
  applicationStatuses.headApproved,
  applicationStatuses.paymentPending,
  applicationStatuses.paymentCompleted,
  applicationStatuses.universityNumberIssued,
  applicationStatuses.socialResearchRequired,
  applicationStatuses.socialResearchSubmitted,
  applicationStatuses.completed,
];

export type WorkflowActor =
  | "student"
  | "ai"
  | "admission_employee"
  | "department_head"
  | "payment_system"
  | "system";

export type WorkflowDecision =
  | "approved"
  | "rejected"
  | "needs_review"
  | "missing_documents"
  | "payment_completed"
  | "payment_failed"
  | "issued"
  | "submitted";

export type ApplicationWorkflowLog = {
  id: string;
  status: ApplicationStatus;
  actor: WorkflowActor;
  decision?: WorkflowDecision;
  actorName?: string;
  note?: string;
  createdAt: string;
};

export function isFinalApplicationStatus(status: ApplicationStatus) {
  return (
    status === applicationStatuses.aiRejected ||
    status === applicationStatuses.employeeRejected ||
    status === applicationStatuses.headRejected ||
    status === applicationStatuses.completed
  );
}

export function isRejectedApplicationStatus(status: ApplicationStatus) {
  return (
    status === applicationStatuses.aiRejected ||
    status === applicationStatuses.employeeRejected ||
    status === applicationStatuses.headRejected
  );
}

export function canEmployeeReview(status: ApplicationStatus) {
  return (
    status === applicationStatuses.aiFailed ||
    status === applicationStatuses.employeeReview
  );
}

export function canDepartmentHeadReview(status: ApplicationStatus) {
  return (
    status === applicationStatuses.employeeApproved ||
    status === applicationStatuses.headReview
  );
}

export function canStudentPay(status: ApplicationStatus) {
  return status === applicationStatuses.paymentPending;
}

export function canStudentCompleteSocialResearch(status: ApplicationStatus) {
  return status === applicationStatuses.socialResearchRequired;
}

export function getNextStatusAfterEmployeeApproval(): ApplicationStatus {
  return applicationStatuses.headReview;
}

export function getNextStatusAfterHeadApproval(): ApplicationStatus {
  return applicationStatuses.paymentPending;
}

export function getNextStatusAfterPaymentSuccess(): ApplicationStatus {
  return applicationStatuses.universityNumberIssued;
}

export function getNextStatusAfterUniversityNumber(): ApplicationStatus {
  return applicationStatuses.socialResearchRequired;
}

export const ALLOWED_PROFILE_COMPLETION_STATUSES: readonly ApplicationStatus[] = [
  applicationStatuses.universityNumberIssued,
  applicationStatuses.socialResearchRequired,
  applicationStatuses.socialResearchSubmitted,
  applicationStatuses.completed,
];

export function isProfileCompletionAllowed(
  appOrStatus?:
    | { currentStatus?: string; universityNumber?: string }
    | ApplicationStatus
    | string
    | null
): boolean {
  if (!appOrStatus) return false;

  if (typeof appOrStatus === "object") {
    if (
      appOrStatus.universityNumber &&
      appOrStatus.universityNumber.trim() !== ""
    ) {
      return true;
    }
    return ALLOWED_PROFILE_COMPLETION_STATUSES.includes(
      appOrStatus.currentStatus as ApplicationStatus
    );
  }

  return ALLOWED_PROFILE_COMPLETION_STATUSES.includes(
    appOrStatus as ApplicationStatus
  );
}
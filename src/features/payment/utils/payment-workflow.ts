import {
  applicationStatuses,
  type ApplicationWorkflowLog,
} from "@/constants/application-workflow";
import {
  workflowApplicationsMock,
  type WorkflowApplication,
} from "@/features/admin/applications/data/applications-workflow.data";

function createLog(
  log: Omit<ApplicationWorkflowLog, "id" | "createdAt">
): ApplicationWorkflowLog {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString(),
    ...log,
  };
}

export function getPaymentSuccessApplication(): WorkflowApplication {
  const application = workflowApplicationsMock.find(
    (item) => item.currentStatus === applicationStatuses.paymentPending
  );

  const baseApplication = application ?? workflowApplicationsMock[2];

  return {
    ...baseApplication,
    currentStatus: applicationStatuses.socialResearchRequired,
    paymentReference: "PAY-2026-1003",
    universityNumber: "202610046",
    socialResearchStatus: "required",
    workflowLogs: [
      ...baseApplication.workflowLogs,
      createLog({
        status: applicationStatuses.paymentCompleted,
        actor: "payment_system",
        decision: "payment_completed",
        actorName: "Payment System",
        note: "Admission fee payment completed successfully.",
      }),
      createLog({
        status: applicationStatuses.universityNumberIssued,
        actor: "system",
        decision: "issued",
        actorName: "System",
        note: "University number issued: 202610046.",
      }),
      createLog({
        status: applicationStatuses.socialResearchRequired,
        actor: "system",
        decision: "needs_review",
        actorName: "System",
        note: "Student must complete the social research form.",
      }),
    ],
  };
}

export function getPaymentFailedApplication(): WorkflowApplication {
  const application = workflowApplicationsMock.find(
    (item) => item.currentStatus === applicationStatuses.paymentPending
  );

  const baseApplication = application ?? workflowApplicationsMock[2];

  return {
    ...baseApplication,
    currentStatus: applicationStatuses.paymentFailed,
    workflowLogs: [
      ...baseApplication.workflowLogs,
      createLog({
        status: applicationStatuses.paymentFailed,
        actor: "payment_system",
        decision: "payment_failed",
        actorName: "Payment System",
        note: "Payment was not completed. The student can try again.",
      }),
    ],
  };
}
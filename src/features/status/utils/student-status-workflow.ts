import { studentStatusSteps } from "../constants/student-status-steps";

export type StudentStepState = "done" | "active" | "pending" | "rejected";

export function getActiveStepIndex(status: string) {
  const index = studentStatusSteps.findIndex((step) =>
    step.statuses.includes(status)
  );

  return index === -1 ? 0 : index;
}

export function getStepState({
  index,
  activeIndex,
  isRejected,
}: {
  index: number;
  activeIndex: number;
  isRejected: boolean;
}): StudentStepState {
  if (isRejected && index === activeIndex) return "rejected";
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "pending";
}

export function isRejectedStatus(status: string) {
  return status === "rejected" || status === "cancelled";
}
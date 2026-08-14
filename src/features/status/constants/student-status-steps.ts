import {
  CheckCircle2,
  FileText,
  UserCheck,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export type StudentStatusStepKey =
  | "draft"
  | "submitted"
  | "under_review"
  | "returned_for_revision"
  | "forwarded_to_department_head"
  | "returned_to_employee"
  | "accepted"
  | "rejected"
  | "cancelled";

export type StudentStatusStep = {
  key: StudentStatusStepKey;
  statuses: string[];
  icon: LucideIcon;
};

export const studentStatusSteps: StudentStatusStep[] = [
  {
    key: "draft",
    statuses: ["draft"],
    icon: FileText,
  },
  {
    key: "submitted",
    statuses: ["submitted"],
    icon: FileText,
  },
  {
    key: "under_review",
    statuses: ["under_review", "returned_to_employee"],
    icon: UserCog,
  },
  {
    key: "returned_for_revision",
    statuses: ["returned_for_revision"],
    icon: FileText,
  },
  {
    key: "forwarded_to_department_head",
    statuses: ["forwarded_to_department_head"],
    icon: UserCheck,
  },
  {
    key: "accepted",
    statuses: ["accepted"],
    icon: CheckCircle2,
  },
  {
    key: "rejected",
    statuses: ["rejected"],
    icon: CheckCircle2,
  },
  {
    key: "cancelled",
    statuses: ["cancelled"],
    icon: CheckCircle2,
  },
];
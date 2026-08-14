export type BackendApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "returned_for_revision"
  | "forwarded_to_department_head"
  | "returned_to_employee"
  | "accepted"
  | "rejected"
  | "cancelled";

// Legacy UI statuses reserved ONLY for frontend demo / pending features
export type LegacyUIStatus =
  | "ai_review"
  | "ai_approved"
  | "ai_rejected"
  | "ai_failed"
  | "employee_review"
  | "employee_approved"
  | "employee_rejected"
  | "missing_documents"
  | "head_review"
  | "head_approved"
  | "head_rejected"
  | "payment_pending"
  | "payment_completed"
  | "payment_failed"
  | "university_number_issued"
  | "social_research_required"
  | "social_research_submitted"
  | "completed";

export type ApplicationStatus = BackendApplicationStatus | LegacyUIStatus;

export type StatusConfig = {
  backendStatus: BackendApplicationStatus;
  labelAr: string;
  labelEn: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  badgeClass: string;
  stepIndex: number; // 0 to 4 timeline representation
  canEdit: boolean;
  canSubmit: boolean;
  canRevise: boolean;
  canCancel: boolean;
};

export const BACKEND_STATUS_MAP: Record<BackendApplicationStatus, StatusConfig> = {
  draft: {
    backendStatus: "draft",
    labelAr: "مسودة",
    labelEn: "Draft",
    variant: "secondary",
    badgeClass: "bg-muted text-muted-foreground border-muted-foreground/20",
    stepIndex: 0,
    canEdit: true,
    canSubmit: true,
    canRevise: false,
    canCancel: true,
  },
  submitted: {
    backendStatus: "submitted",
    labelAr: "تم التقديم",
    labelEn: "Submitted",
    variant: "info",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    stepIndex: 1,
    canEdit: false,
    canSubmit: false,
    canRevise: false,
    canCancel: true,
  },
  under_review: {
    backendStatus: "under_review",
    labelAr: "قيد المراجعة",
    labelEn: "Under Review",
    variant: "warning",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    stepIndex: 2,
    canEdit: false,
    canSubmit: false,
    canRevise: false,
    canCancel: false,
  },
  returned_for_revision: {
    backendStatus: "returned_for_revision",
    labelAr: "معاد للتعديل",
    labelEn: "Returned for Revision",
    variant: "warning",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    stepIndex: 1,
    canEdit: true,
    canSubmit: true,
    canRevise: true,
    canCancel: true,
  },
  forwarded_to_department_head: {
    backendStatus: "forwarded_to_department_head",
    labelAr: "محال للقسم الأكاديمي",
    labelEn: "Forwarded to Department Head",
    variant: "info",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    stepIndex: 2,
    canEdit: false,
    canSubmit: false,
    canRevise: false,
    canCancel: false,
  },
  returned_to_employee: {
    backendStatus: "returned_to_employee",
    labelAr: "معاد لموظف القبول",
    labelEn: "Returned to Employee",
    variant: "warning",
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    stepIndex: 2,
    canEdit: false,
    canSubmit: false,
    canRevise: false,
    canCancel: false,
  },
  accepted: {
    backendStatus: "accepted",
    labelAr: "مقبول",
    labelEn: "Accepted",
    variant: "success",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    stepIndex: 3,
    canEdit: false,
    canSubmit: false,
    canRevise: false,
    canCancel: false,
  },
  rejected: {
    backendStatus: "rejected",
    labelAr: "مرفوض",
    labelEn: "Rejected",
    variant: "destructive",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    stepIndex: 3,
    canEdit: false,
    canSubmit: false,
    canRevise: false,
    canCancel: false,
  },
  cancelled: {
    backendStatus: "cancelled",
    labelAr: "ملغى",
    labelEn: "Cancelled",
    variant: "outline",
    badgeClass: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
    stepIndex: 0,
    canEdit: false,
    canSubmit: false,
    canRevise: false,
    canCancel: false,
  },
};

/**
 * Maps legacy UI statuses to equivalent backend status for display normalization.
 */
export function normalizeStatus(status?: string | null): BackendApplicationStatus {
  if (!status) return "draft";
  const s = status.toLowerCase();

  if (s in BACKEND_STATUS_MAP) {
    return s as BackendApplicationStatus;
  }

  // Legacy mappings
  if (s === "ai_review" || s === "employee_review" || s === "head_review") {
    return "under_review";
  }
  if (s === "missing_documents") {
    return "returned_for_revision";
  }
  if (s === "employee_approved" || s === "head_approved") {
    return "forwarded_to_department_head";
  }
  if (s === "completed" || s === "payment_completed" || s === "university_number_issued") {
    return "accepted";
  }
  if (s === "ai_rejected" || s === "employee_rejected" || s === "head_rejected") {
    return "rejected";
  }

  return "draft";
}

export function getStatusConfig(status?: string | null): StatusConfig {
  const normalized = normalizeStatus(status);
  return BACKEND_STATUS_MAP[normalized];
}

export function getStatusLabel(status: string | null | undefined, locale: string = "ar"): string {
  const config = getStatusConfig(status);
  return locale === "ar" ? config.labelAr : config.labelEn;
}

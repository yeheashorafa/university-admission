import type {
  AiRecommendation,
  ExtractedField,
  RiskLevel,
  VerificationIssueType,
  VerificationQueueItem,
  VerificationStatus,
} from "../data/document-verification.data";

export type RawBackendDocument = {
  id: string | number;
  document_type_id?: string | number;
  documentTypeName?: string;
  type?: string;
  title?: string;
  name?: string;
  fileUrl?: string;
  file_path?: string;
  ai_check_status?: string;
  ai_status?: string;
  verification_status?: string;
  status?: string;
  aiConfidence?: number;
  ai_confidence?: number;
  notes?: string;
  rejectionReason?: string;
  uploadedAt?: string;
  created_at?: string;
};

export type RawBackendApplication = {
  id: string | number;
  applicationNo?: string;
  application_no?: string;
  studentName?: string;
  student_name?: string;
  studentEmail?: string;
  student_email?: string;
  nationalId?: string;
  national_id?: string;
  program?: string;
  status?: string;
  submittedAt?: string;
  submitted_at?: string;
  created_at?: string;
  aiVerificationStatus?: string;
  ai_verification_status?: string;
  ai_check_status?: string;
  aiConfidence?: number;
  ai_confidence?: number;
  documents?: RawBackendDocument[];
  [key: string]: unknown;
};

/**
 * Evaluates whether a specific document belonging to an application is pending verification.
 */
export function isPendingDocumentVerification(
  app: RawBackendApplication,
  doc?: RawBackendDocument
): boolean {
  if (!app) return false;

  const appStatus = String(app.status || "").toLowerCase();

  // Exclude terminal / non-reviewable application statuses
  if (["accepted", "rejected", "cancelled", "draft"].includes(appStatus)) {
    return false;
  }

  const isReviewableAppStatus = [
    "submitted",
    "under_review",
    "returned_to_employee",
    "returned_for_revision",
    "ai_failed",
    "employee_review",
  ].includes(appStatus);

  if (!isReviewableAppStatus) {
    return false;
  }

  if (doc) {
    const docAi = String(doc.ai_check_status || doc.ai_status || "").toLowerCase();
    const docVer = String(doc.verification_status || doc.status || "").toLowerCase();

    // If explicitly verified/approved/accepted, it is NOT pending
    if (["verified", "approved", "accepted"].includes(docVer) || docAi === "verified") {
      return false;
    }

    const isPendingAi = [
      "pending",
      "failed",
      "manual_review",
      "needs_review",
      "ai_failed",
    ].includes(docAi);

    const isPendingVerification = [
      "pending",
      "unverified",
      "reupload_requested",
      "failed",
    ].includes(docVer);

    if (isPendingAi || isPendingVerification) {
      return true;
    }

    // Fallback: If document has no explicit status fields, default to true for reviewable applications
    if (!docAi && !docVer) {
      return true;
    }

    return false;
  }

  // App-level check fallback when application has no documents list
  const appAi = String(
    app.aiVerificationStatus || app.ai_verification_status || app.ai_check_status || ""
  ).toLowerCase();

  if (appAi === "verified" || appAi === "approved") {
    return false;
  }

  return true;
}

/**
 * Evaluates whether an application requires manual operational review.
 */
export function isPendingManualReview(app: RawBackendApplication): boolean {
  if (!app) return false;
  const appStatus = String(app.status || "").toLowerCase();
  if (["accepted", "rejected", "cancelled", "draft"].includes(appStatus)) {
    return false;
  }
  return appStatus === "under_review" || appStatus === "returned_to_employee" || appStatus === "submitted";
}

function getDocumentKeyFromType(typeStr?: string): VerificationQueueItem["documentKey"] {
  const s = String(typeStr || "").toLowerCase();
  if (s.includes("id") || s.includes("هوية") || s.includes("national")) {
    return "nationalIdImage";
  }
  if (s.includes("transcript") || s.includes("جامع") || s.includes("علامات")) {
    return "universityTranscript";
  }
  return "highSchoolCertificate";
}

/**
 * Flattens applications into individual document verification queue items.
 */
export function flattenPendingDocumentQueue(
  applications: RawBackendApplication[]
): VerificationQueueItem[] {
  const items: VerificationQueueItem[] = [];

  for (const app of applications) {
    const docs = app.documents;
    const appId = String(app.id);
    const appNo = app.applicationNo || app.application_no || `APP-${app.id}`;
    const studentName = app.studentName || app.student_name || "طالب غير محدد";

    if (Array.isArray(docs) && docs.length > 0) {
      for (const doc of docs) {
        if (isPendingDocumentVerification(app, doc)) {
          const docId = String(doc.id);
          const compositeId = `${appId}:${docId}`;

          const docStatus: VerificationStatus =
            doc.verification_status === "verified" || doc.status === "verified" || doc.status === "approved"
              ? "approved"
              : doc.verification_status === "rejected" || doc.status === "rejected"
                ? "rejected"
                : doc.verification_status === "reupload_requested" || doc.status === "reupload_requested"
                  ? "reupload_requested"
                  : "pending";

          const issueType: VerificationIssueType =
            doc.ai_check_status === "failed" ? "grade_mismatch" : "unclear_image";

          items.push({
            id: compositeId,
            applicationId: appId,
            documentId: docId,
            applicationNo: appNo,
            studentName,
            documentTypeName: doc.documentTypeName || doc.title || doc.name || doc.type || "مستند الطالب",
            documentKey: getDocumentKeyFromType(doc.documentTypeName || doc.type || doc.title),
            studentKey: "mohammadAbdullah",
            issueKey: issueType === "grade_mismatch" ? "gradeMismatch" : "unclearImage",
            issueType,
            status: docStatus,
            fileName: doc.fileUrl || doc.file_path || `${appNo}-document.pdf`,
            fileUrl: doc.fileUrl || doc.file_path,
            uploadedAt: doc.uploadedAt || doc.created_at || app.submittedAt || app.created_at || "",
            recommendation: (doc as Record<string, unknown>).ai_recommendation as AiRecommendation | undefined,
            riskLevel: (doc as Record<string, unknown>).risk_level as RiskLevel | undefined,
            extractedFields: (doc as Record<string, unknown>).extracted_fields as ExtractedField[] | undefined,
            rawApplication: app,
            rawDocument: doc,
          });
        }
      }
    }
  }

  return items;
}

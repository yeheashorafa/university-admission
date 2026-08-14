export type VerificationIssueType =
  | "grade_mismatch"
  | "unclear_image"
  | "missing_signature";

export type VerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "reupload_requested";

export type AiRecommendation =
  | "auto_approved"
  | "manual_review"
  | "auto_rejected";

export type RiskLevel = "low" | "medium" | "high";

export type ExtractedFieldStatus = "matched" | "mismatch" | "missing";

export type ExtractedField = {
  id: "student-name" | "average" | "graduation-year";
  status: ExtractedFieldStatus;
  extractedValue?: string;
  submittedValue?: string;
  correctedValue?: string;
};

export type VerificationQueueItem = {
  id: string;
  applicationId?: string | number;
  documentId?: string | number;
  applicationNo: string;
  studentName?: string;
  documentTypeName?: string;
  documentKey:
    | "highSchoolCertificate"
    | "nationalIdImage"
    | "universityTranscript";
  studentKey?: string;
  issueKey?: string;
  issueType: VerificationIssueType;
  status: VerificationStatus;

  fileName: string;
  fileUrl?: string;
  uploadedAt: string;
  recommendation?: AiRecommendation;

  riskLevel?: RiskLevel;
  extractedFields?: ExtractedField[];
  rawApplication?: unknown;
  rawDocument?: unknown;
};
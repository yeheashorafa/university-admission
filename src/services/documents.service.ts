import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type AiCheckStatus = "pending" | "verified" | "failed";

export type StudentDocument = {
  id: string | number;
  document_type_id?: string | number;
  documentTypeName?: string;
  type?: string;
  title?: string;
  notes?: string;
  fileUrl?: string;
  ai_check_status?: AiCheckStatus;
  aiCheckNotes?: string;
  rejectionReason?: string;
  uploadedAt?: string;
  createdAt?: string;
};

export type UploadDocumentParams = {
  file: File;
  document_type_id: string | number;
  notes?: string;
};

export const ALLOWED_DOCUMENT_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export function isAllowedFileType(file: File): boolean {
  if (!file) return false;
  if (ALLOWED_DOCUMENT_FILE_TYPES.includes(file.type.toLowerCase())) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "pdf" || ext === "jpg" || ext === "jpeg" || ext === "png";
}

export async function getMyDocuments(): Promise<StudentDocument[]> {
  const response = await apiClient.get(ENDPOINTS.student.documents);
  return extractArray<StudentDocument>(response.data);
}

export async function getDocumentById(id: string | number): Promise<StudentDocument> {
  const response = await apiClient.get(ENDPOINTS.student.documentDetail(id));
  return extractResource<StudentDocument>(response.data);
}

export async function uploadDocument(
  paramOrType: UploadDocumentParams | string | number,
  maybeFile?: File,
  maybeNotes?: string
): Promise<StudentDocument> {
  const formData = new FormData();

  if (typeof paramOrType === "object" && paramOrType !== null && "file" in paramOrType) {
    if (!isAllowedFileType(paramOrType.file)) {
      throw new Error("نوع الملف غير مسموح. يرجى اختيار ملف PDF أو JPG أو PNG.");
    }
    formData.append("file", paramOrType.file);
    formData.append("document_type_id", String(paramOrType.document_type_id));
    formData.append("notes", paramOrType.notes || "");
  } else {
    if (maybeFile && !isAllowedFileType(maybeFile)) {
      throw new Error("نوع الملف غير مسموح. يرجى اختيار ملف PDF أو JPG أو PNG.");
    }
    formData.append("document_type_id", String(paramOrType));
    if (maybeFile) {
      formData.append("file", maybeFile);
    }
    formData.append("notes", maybeNotes || "");
  }

  const response = await apiClient.post(
    ENDPOINTS.student.documents,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return extractResource<StudentDocument>(response.data);
}

export async function deleteDocument(documentId: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.student.deleteDocument(documentId));
}

export async function attachDocumentToApplication(
  applicationId: string | number,
  documentId: string | number
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post<{ success: boolean; message?: string }>(
    ENDPOINTS.student.attachDocument(applicationId, documentId)
  );
  return response.data;
}
import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { BackendApplicationStatus } from "@/lib/adapters/status-adapter";

export type EmployeeComment = {
  id: string | number;
  comment: string;
  author?: string;
  created_at?: string;
};

export type EmployeeApplication = {
  id: string | number;
  applicationNo: string;
  studentName: string;
  studentEmail: string;
  nationalId?: string;
  program: string;
  status: BackendApplicationStatus;
  submittedAt: string;
  aiVerificationStatus?: "pending" | "verified" | "failed";
  commentsCount?: number;
  comments?: EmployeeComment[];
};

export async function getEmployeeApplications(params?: {
  page?: number;
  status?: string;
  search?: string;
}): Promise<EmployeeApplication[]> {
  const response = await apiClient.get<EmployeeApplication[] | { data: EmployeeApplication[] }>(
    ENDPOINTS.admissionEmployee.applications,
    { params }
  );
  return extractArray<EmployeeApplication>(response.data);
}

export async function getEmployeeApplicationById(
  id: string | number
): Promise<EmployeeApplication> {
  const response = await apiClient.get<EmployeeApplication | { data: EmployeeApplication }>(
    ENDPOINTS.admissionEmployee.applicationDetail(id)
  );
  return extractResource<EmployeeApplication>(response.data);
}

export async function forwardApplicationToDepartment(
  id: string | number
): Promise<EmployeeApplication> {
  const response = await apiClient.post<EmployeeApplication | { data: EmployeeApplication }>(
    ENDPOINTS.admissionEmployee.forward(id)
  );
  return extractResource<EmployeeApplication>(response.data);
}

export async function requestApplicationRevision(
  id: string | number
): Promise<EmployeeApplication> {
  const response = await apiClient.post<EmployeeApplication | { data: EmployeeApplication }>(
    ENDPOINTS.admissionEmployee.requestRevision(id)
  );
  return extractResource<EmployeeApplication>(response.data);
}

export async function reForwardApplication(
  id: string | number,
  payload?: { forward_to?: string; note?: string }
): Promise<EmployeeApplication> {
  const response = await apiClient.post<EmployeeApplication | { data: EmployeeApplication }>(
    ENDPOINTS.admissionEmployee.reForward(id),
    payload
  );
  return extractResource<EmployeeApplication>(response.data);
}

export async function rejectApplicationByEmployee(
  id: string | number,
  reason: string
): Promise<EmployeeApplication> {
  const response = await apiClient.post<EmployeeApplication | { data: EmployeeApplication }>(
    ENDPOINTS.admissionEmployee.reject(id),
    { decision_reason: reason }
  );
  return extractResource<EmployeeApplication>(response.data);
}

export async function verifyAiCheck(
  id: string | number,
  notes?: string
): Promise<EmployeeApplication> {
  const response = await apiClient.post<EmployeeApplication | { data: EmployeeApplication }>(
    ENDPOINTS.admissionEmployee.verifyAi(id),
    notes ? { decision_reason: notes } : undefined
  );
  return extractResource<EmployeeApplication>(response.data);
}

export async function addEmployeeComment(
  id: string | number,
  comment: string
): Promise<{ id: string | number; comment: string; createdAt: string }> {
  const response = await apiClient.post<{ id: string | number; comment: string; createdAt: string }>(
    ENDPOINTS.admissionEmployee.comments(id),
    { comment }
  );
  return response.data;
}

export async function updateEmployeeComment(
  applicationId: string | number,
  commentId: string | number,
  comment: string
): Promise<{ id: string | number; comment: string; createdAt: string }> {
  const response = await apiClient.put<{ id: string | number; comment: string; createdAt: string }>(
    ENDPOINTS.admissionEmployee.updateComment(applicationId, commentId),
    { comment }
  );
  return response.data;
}

export async function deleteEmployeeComment(
  applicationId: string | number,
  commentId: string | number
): Promise<void> {
  await apiClient.delete(
    ENDPOINTS.admissionEmployee.deleteComment(applicationId, commentId)
  );
}

export async function verifyDocumentByEmployee(
  documentId: string | number,
  status: "verified" | "rejected",
  reviewNotes?: string
): Promise<unknown> {
  const response = await apiClient.post(
    ENDPOINTS.admissionEmployee.verifyDocument(documentId),
    { status, review_notes: reviewNotes }
  );
  return response.data;
}


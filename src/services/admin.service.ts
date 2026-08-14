import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { BackendApplicationStatus } from "@/lib/adapters/status-adapter";

export type AdminApplicationStatus = BackendApplicationStatus;

export type AdminApplication = {
  id: string | number;
  applicationNo: string;
  studentName: string;
  email: string;
  program: string;
  status: BackendApplicationStatus;
  submittedAt: string;
  assignedReviewerId?: string | number;
};

export async function getAdminApplications(params?: {
  page?: number;
  status?: string;
  search?: string;
}): Promise<AdminApplication[]> {
  const response = await apiClient.get<AdminApplication[] | { data: AdminApplication[] }>(
    ENDPOINTS.admin.applications,
    { params }
  );
  return extractArray<AdminApplication>(response.data);
}

export async function getAdminApplicationById(
  applicationId: string | number
): Promise<AdminApplication> {
  const response = await apiClient.get<AdminApplication | { data: AdminApplication }>(
    ENDPOINTS.admin.applicationDetail(applicationId)
  );
  return extractResource<AdminApplication>(response.data);
}

export async function assignReviewerToApplication(
  applicationId: string | number,
  reviewerId: string | number
): Promise<AdminApplication> {
  const response = await apiClient.post<AdminApplication | { data: AdminApplication }>(
    ENDPOINTS.admin.assignReviewer(applicationId),
    { assigned_reviewer_id: reviewerId }
  );
  return extractResource<AdminApplication>(response.data);
}

export async function cancelApplicationByAdmin(
  applicationId: string | number,
  reason?: string
): Promise<AdminApplication> {
  const response = await apiClient.post<AdminApplication | { data: AdminApplication }>(
    ENDPOINTS.admin.cancelApplication(applicationId),
    { reason }
  );
  return extractResource<AdminApplication>(response.data);
}

export async function getAdminFaculties() {
  const response = await apiClient.get(ENDPOINTS.admin.faculties);
  return extractArray(response.data);
}

export async function getAdminDepartments() {
  const response = await apiClient.get(ENDPOINTS.admin.departments);
  return extractArray(response.data);
}

export async function getAdminMasterCatalogPrograms() {
  const response = await apiClient.get(ENDPOINTS.admin.programs);
  return extractArray(response.data);
}

export async function getAdminAdmissionCycles() {
  const response = await apiClient.get(ENDPOINTS.admin.admissionCycles);
  return extractArray(response.data);
}

export async function getAdminDocumentTypes() {
  const response = await apiClient.get(ENDPOINTS.admin.documentTypes);
  return extractArray(response.data);
}

export async function getAdminApplicationTypes() {
  const response = await apiClient.get(ENDPOINTS.admin.applicationTypes);
  return extractArray(response.data);
}
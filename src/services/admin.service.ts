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

export type AdminFaculty = {
  id: string | number;
  name?: string;
  name_en?: string;
  name_ar?: string;
  is_active?: boolean;
};

export type AdminDepartment = {
  id: string | number;
  faculty_id: string | number;
  name?: string;
  name_en?: string;
  name_ar?: string;
  is_active?: boolean;
};

export async function getAdminFaculties(): Promise<AdminFaculty[]> {
  const response = await apiClient.get(ENDPOINTS.admin.faculties);
  return extractArray<AdminFaculty>(response.data);
}

export async function getAdminDepartments(): Promise<AdminDepartment[]> {
  const response = await apiClient.get(ENDPOINTS.admin.departments);
  return extractArray<AdminDepartment>(response.data);
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

// ---------- Faculties CRUD ----------

export type AdminFacultyPayload = {
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  is_active?: boolean;
};

export async function createAdminFaculty(
  payload: AdminFacultyPayload
): Promise<Record<string, unknown>> {
  const response = await apiClient.post(ENDPOINTS.admin.faculties, payload);
  return extractResource<Record<string, unknown>>(response.data);
}

export async function updateAdminFaculty(
  facultyId: string | number,
  payload: Partial<AdminFacultyPayload>
): Promise<Record<string, unknown>> {
  const response = await apiClient.put(
    `${ENDPOINTS.admin.faculties}/${facultyId}`,
    payload
  );
  return extractResource<Record<string, unknown>>(response.data);
}

export async function deleteAdminFaculty(facultyId: string | number): Promise<void> {
  await apiClient.delete(`${ENDPOINTS.admin.faculties}/${facultyId}`);
}

// ---------- Departments CRUD ----------

export type AdminDepartmentPayload = {
  faculty_id: string | number;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  is_active?: boolean;
};

export async function createAdminDepartment(
  payload: AdminDepartmentPayload
): Promise<Record<string, unknown>> {
  const response = await apiClient.post(ENDPOINTS.admin.departments, payload);
  return extractResource<Record<string, unknown>>(response.data);
}

export async function updateAdminDepartment(
  departmentId: string | number,
  payload: Partial<AdminDepartmentPayload>
): Promise<Record<string, unknown>> {
  const response = await apiClient.put(
    `${ENDPOINTS.admin.departments}/${departmentId}`,
    payload
  );
  return extractResource<Record<string, unknown>>(response.data);
}

export async function deleteAdminDepartment(
  departmentId: string | number
): Promise<void> {
  await apiClient.delete(`${ENDPOINTS.admin.departments}/${departmentId}`);
}

// ---------- Admission Cycles CRUD ----------

export type AdminAdmissionCyclePayload = {
  name: string;
  academic_year: string;
  semester: "first" | "second" | "summer";
  starts_at: string;
  ends_at: string;
  is_active?: boolean;
};

export async function createAdminAdmissionCycle(
  payload: AdminAdmissionCyclePayload
): Promise<Record<string, unknown>> {
  const response = await apiClient.post(ENDPOINTS.admin.admissionCycles, payload);
  return extractResource<Record<string, unknown>>(response.data);
}

export async function updateAdminAdmissionCycle(
  cycleId: string | number,
  payload: Partial<AdminAdmissionCyclePayload>
): Promise<Record<string, unknown>> {
  const response = await apiClient.put(
    `${ENDPOINTS.admin.admissionCycles}/${cycleId}`,
    payload
  );
  return extractResource<Record<string, unknown>>(response.data);
}

export async function deleteAdminAdmissionCycle(
  cycleId: string | number
): Promise<void> {
  await apiClient.delete(`${ENDPOINTS.admin.admissionCycles}/${cycleId}`);
}

// ---------- Document Types CRUD ----------

export type AdminDocumentTypePayload = {
  name: string;
  display_name_en: string;
  display_name_ar: string;
  description?: string;
  is_required?: boolean;
};

export async function createAdminDocumentType(
  payload: AdminDocumentTypePayload
): Promise<Record<string, unknown>> {
  const response = await apiClient.post(ENDPOINTS.admin.documentTypes, payload);
  return extractResource<Record<string, unknown>>(response.data);
}

export async function updateAdminDocumentType(
  documentTypeId: string | number,
  payload: Partial<AdminDocumentTypePayload>
): Promise<Record<string, unknown>> {
  const response = await apiClient.put(
    `${ENDPOINTS.admin.documentTypes}/${documentTypeId}`,
    payload
  );
  return extractResource<Record<string, unknown>>(response.data);
}

export async function deleteAdminDocumentType(
  documentTypeId: string | number
): Promise<void> {
  await apiClient.delete(`${ENDPOINTS.admin.documentTypes}/${documentTypeId}`);
}

// ---------- Application Types CRUD ----------

export type AdminApplicationTypePayload = {
  code: string;
  name_ar: string;
  name_en: string;
  requires_department_head_approval?: boolean;
  is_active?: boolean;
};

export async function createAdminApplicationType(
  payload: AdminApplicationTypePayload
): Promise<Record<string, unknown>> {
  const response = await apiClient.post(ENDPOINTS.admin.applicationTypes, payload);
  return extractResource<Record<string, unknown>>(response.data);
}

export async function updateAdminApplicationType(
  applicationTypeId: string | number,
  payload: Partial<AdminApplicationTypePayload>
): Promise<Record<string, unknown>> {
  const response = await apiClient.put(
    `${ENDPOINTS.admin.applicationTypes}/${applicationTypeId}`,
    payload
  );
  return extractResource<Record<string, unknown>>(response.data);
}

export async function deleteAdminApplicationType(
  applicationTypeId: string | number
): Promise<void> {
  await apiClient.delete(`${ENDPOINTS.admin.applicationTypes}/${applicationTypeId}`);
}
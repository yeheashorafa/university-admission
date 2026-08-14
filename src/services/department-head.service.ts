import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { BackendApplicationStatus } from "@/lib/adapters/status-adapter";

export type HeadApplication = {
  id: string | number;
  applicationNo: string;
  studentName: string;
  studentEmail: string;
  program: string;
  department: string;
  status: BackendApplicationStatus;
  forwardedAt?: string;
  employeeNotes?: string;
};

export async function getHeadApplications(params?: {
  page?: number;
  status?: string;
  search?: string;
}): Promise<HeadApplication[]> {
  const response = await apiClient.get<HeadApplication[] | { data: HeadApplication[] }>(
    ENDPOINTS.departmentHead.applications,
    { params }
  );
  return extractArray<HeadApplication>(response.data);
}

export async function getHeadApplicationById(
  id: string | number
): Promise<HeadApplication> {
  const response = await apiClient.get<HeadApplication | { data: HeadApplication }>(
    ENDPOINTS.departmentHead.applicationDetail(id)
  );
  return extractResource<HeadApplication>(response.data);
}

export async function acceptApplicationByHead(
  id: string | number
): Promise<HeadApplication> {
  const response = await apiClient.post<HeadApplication | { data: HeadApplication }>(
    ENDPOINTS.departmentHead.accept(id)
  );
  return extractResource<HeadApplication>(response.data);
}

export async function rejectApplicationByHead(
  id: string | number
): Promise<HeadApplication> {
  const response = await apiClient.post<HeadApplication | { data: HeadApplication }>(
    ENDPOINTS.departmentHead.reject(id)
  );
  return extractResource<HeadApplication>(response.data);
}

export async function returnApplicationToEmployee(
  id: string | number
): Promise<HeadApplication> {
  const response = await apiClient.post<HeadApplication | { data: HeadApplication }>(
    ENDPOINTS.departmentHead.returnToEmployee(id)
  );
  return extractResource<HeadApplication>(response.data);
}

import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Program } from "./programs.service";

export type AdminProgramPayload = {
  department_id: string | number;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  minimum_average: number;
  is_active: boolean;
};

export async function getAdminPrograms(params?: {
  page?: number;
  search?: string;
  faculty?: string;
  status?: string;
}): Promise<Program[]> {
  const response = await apiClient.get<Program[] | { data: Program[] }>(
    ENDPOINTS.admin.programs,
    { params }
  );
  return extractArray<Program>(response.data);
}

export async function createAdminProgram(payload: AdminProgramPayload): Promise<Program> {
  const response = await apiClient.post<Program | { data: Program }>(
    ENDPOINTS.admin.programs,
    payload
  );
  return extractResource<Program>(response.data);
}

export async function updateAdminProgram(
  programId: string | number,
  payload: Partial<AdminProgramPayload>
): Promise<Program> {
  const response = await apiClient.put<Program | { data: Program }>(
    `${ENDPOINTS.admin.programs}/${programId}`,
    payload
  );
  return extractResource<Program>(response.data);
}

export async function deleteAdminProgram(programId: string | number): Promise<void> {
  await apiClient.delete(`${ENDPOINTS.admin.programs}/${programId}`);
}
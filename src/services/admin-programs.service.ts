import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Program } from "./programs.service";

import { parseAdminProgramsPage } from "@/features/admin/programs/data/programs-list-response";

export type AdminProgramDetailsPayload = {
  why_study_ar?: string | null;
  why_study_en?: string | null;
  degree_level_ar?: string | null;
  degree_level_en?: string | null;
  duration_years?: number | null;
  admission_cycle_id?: number | null;
  fee?: {
    price_per_hour_dinar: number;
    credit_hours: number;
    source_url?: string | null;
  };
  admission_thresholds?: Array<{
    branch_id: number;
    gender: "male" | "female";
    min_average_percent: number;
    source_url?: string | null;
  }>;
  career_opportunities?: Array<{ ar: string; en?: string | null }>;
  objectives?: Array<{ ar: string; en?: string | null }>;
  graduate_outcomes?: Array<{ ar: string; en?: string | null }>;
  courses?: Array<{
    code?: string | null;
    name_ar: string;
    name_en?: string | null;
    credit_hours: number;
    semester?: string | null;
    level?: string | null;
    course_type?: string | null;
  }>;
  links?: Array<{
    kind: string;
    label_ar: string;
    label_en?: string | null;
    url: string;
    sort_order?: number;
    is_active?: boolean;
  }>;
};

export type AdminProgramPayload = {
  faculty_id: string | number;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  minimum_average: number | null;
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

export async function updateAdminProgramCatalogDetails(
  programId: string | number,
  payload: AdminProgramDetailsPayload,
): Promise<Program> {
  const response = await apiClient.put(
    `${ENDPOINTS.admin.programs}/${programId}/catalog-details`,
    payload,
  );
  return extractResource<Program>(response.data);
}

export async function getAllAdminPrograms(): Promise<Program[]> {
  const collected: Program[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const response = await apiClient.get(ENDPOINTS.admin.programs, {
      params: { page, per_page: 100 },
    });
    const parsed = parseAdminProgramsPage(response.data, page);
    collected.push(...parsed.programs);
    lastPage = parsed.lastPage;
    page += 1;
  } while (page <= lastPage);
  return collected;
}

export async function getAdminProgramCatalogDetails(programId: string | number): Promise<Program> {
  const response = await apiClient.get(`${ENDPOINTS.admin.programs}/${programId}/catalog-details`);
  return extractResource<Program>(response.data);
}

import { apiClient, extractArray } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export interface PublicAdmissionCycle {
  id: string | number;
  name?: string;
  code?: string;
  year?: string;
  academic_year?: string;
  status?: string;
  is_active?: boolean;
  starts_at?: string;
  ends_at?: string;
  start_date?: string; // fallback
  end_date?: string; // fallback
  [key: string]: unknown;
}

export function isAdmissionCycleOpen(cycle: PublicAdmissionCycle): boolean {
  if (!cycle) return false;
  const statusOk =
    cycle.status === "open" ||
    cycle.status === "active" ||
    cycle.is_active === true;
  if (!statusOk) return false;

  const start = cycle.starts_at || cycle.start_date;
  const end = cycle.ends_at || cycle.end_date;

  if (start || end) {
    const now = Date.now();
    if (start) {
      const startTime = new Date(start).getTime();
      if (!isNaN(startTime) && now < startTime) return false;
    }
    if (end) {
      const endTime = new Date(end).getTime();
      if (!isNaN(endTime) && now > endTime) return false;
    }
  }

  return true;
}

export interface PublicFaculty {
  id: string | number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  title?: string;
  description?: string;
  description_ar?: string;
  description_en?: string;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface PublicProgram {
  faculty_id?: string | number;
  id: string | number;
  name?: string;
  name_ar?: string;
  name_en?: string;
  title?: string;
  description?: string;
  minimum_average?: number;
  minimumAverage?: number;
  min_rate?: number;
  degree?: string;
  duration_years?: number;
  durationYears?: number;
  branches?: string[];
  is_active?: boolean;
  [key: string]: unknown;
}

export interface PublicDocumentType {
  id: string | number;
  name: string;
  display_name_ar?: string;
  display_name_en?: string;
  is_required?: boolean;
  isRequired?: boolean;
  description?: string;
  [key: string]: unknown;
}

export interface PublicApplicationType {
  id: string | number;
  name: string;
  code?: string;
  description?: string;
  [key: string]: unknown;
}

export async function getAdmissionCycles(): Promise<PublicAdmissionCycle[]> {
  const response = await apiClient.get(ENDPOINTS.public.admissionCycles);
  return extractArray<PublicAdmissionCycle>(response.data);
}

export async function getPublicFaculties(): Promise<PublicFaculty[]> {
  const response = await apiClient.get(ENDPOINTS.public.faculties);
  return extractArray<PublicFaculty>(response.data);
}

export async function getFacultyPrograms(facultyId: string | number): Promise<PublicProgram[]> {
  const programs: PublicProgram[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const { data } = await apiClient.get(ENDPOINTS.public.facultyPrograms(facultyId), { params: { page, per_page: 50 } });
    programs.push(...extractArray<PublicProgram>(data));
    lastPage = data?.meta?.last_page ?? 1;
    page++;
  } while (page <= lastPage);

  return programs;
}

export async function getDocumentTypes(): Promise<PublicDocumentType[]> {
  const response = await apiClient.get(ENDPOINTS.public.documentTypes);
  return extractArray<PublicDocumentType>(response.data);
}

// Backend Gap Check: Attempt to fetch public application types, return empty or fallback if non-existent
export async function getPublicApplicationTypes(): Promise<PublicApplicationType[]> {
  try {
    const response = await apiClient.get(ENDPOINTS.public.applicationTypes);
    return extractArray<PublicApplicationType>(response.data);
  } catch {
    // PENDING_BACKEND_API: GET /public/application-types missing from public backend routes
    return [];
  }
}

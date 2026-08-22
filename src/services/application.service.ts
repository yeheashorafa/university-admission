import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { BackendApplicationStatus } from "@/lib/adapters/status-adapter";
import {
  adaptBackendApplication,
  type BackendApplicationRaw,
  type StudentApplicationDetail,
} from "@/lib/adapters/application-adapter";

export type { BackendApplicationStatus, StudentApplicationDetail };

export type ApplicationPreference = {
  programId: string | number;
  programName?: string;
  order: number;
};



export type ApplicationPayload = {
  admission_cycle_id?: string | number;
  application_type_id?: string | number;
  program_id?: string | number;
  student_notes?: string;
  selectedPrograms?: (string | number)[];
};

export type StudentDashboardStats = {
  activeApplication?: StudentApplicationDetail | null;
  totalApplicationsCount: number;
  documentsCount: number;
  verifiedDocumentsCount: number;
  notificationsCount: number;
};

export async function getStudentDashboard(): Promise<StudentDashboardStats> {
  const response = await apiClient.get(ENDPOINTS.student.dashboard);
  const raw = extractResource<Record<string, unknown>>(response.data);
  const stats = (raw?.statistics || raw?.stats || {}) as Record<string, unknown>;

  const rawApps = extractArray<BackendApplicationRaw>(raw?.applications);
  const applications = rawApps.map((app) => adaptBackendApplication(app));

  const activeRaw = raw?.activeApplication as BackendApplicationRaw | undefined;
  const activeApp = activeRaw
    ? adaptBackendApplication(activeRaw)
    : applications.find((a) => a.status !== "cancelled") || applications[0] || null;

  return {
    activeApplication: activeApp,
    totalApplicationsCount: Number(stats?.total_applications ?? raw?.totalApplicationsCount ?? applications.length),
    documentsCount: Number(stats?.total_documents ?? raw?.documentsCount ?? 0),
    verifiedDocumentsCount: Number(stats?.verified_documents ?? raw?.verifiedDocumentsCount ?? 0),
    notificationsCount: Number(stats?.notifications_count ?? raw?.notificationsCount ?? 0),
  };
}

export async function getStudentApplications(): Promise<StudentApplicationDetail[]> {
  const response = await apiClient.get(ENDPOINTS.student.applications);
  const data = response.data as Record<string, unknown> | BackendApplicationRaw[] | undefined;

  let rawList: BackendApplicationRaw[] = [];
  if (Array.isArray(data)) {
    rawList = data;
  } else if (data && typeof data === "object") {
    if (Array.isArray(data.applications)) {
      rawList = data.applications as BackendApplicationRaw[];
    } else if (Array.isArray(data.data)) {
      rawList = data.data as BackendApplicationRaw[];
    } else if (Array.isArray(data.items)) {
      rawList = data.items as BackendApplicationRaw[];
    } else if (data.data && typeof data.data === "object") {
      const inner = data.data as Record<string, unknown>;
      if (Array.isArray(inner.applications)) {
        rawList = inner.applications as BackendApplicationRaw[];
      } else if (Array.isArray(inner.data)) {
        rawList = inner.data as BackendApplicationRaw[];
      } else if (Array.isArray(inner.items)) {
        rawList = inner.items as BackendApplicationRaw[];
      } else {
        rawList = extractArray<BackendApplicationRaw>(response.data);
      }
    } else {
      rawList = extractArray<BackendApplicationRaw>(response.data);
    }
  }

  return rawList.map((item) => adaptBackendApplication(item));
}

export async function createStudentApplication(
  payload: ApplicationPayload
): Promise<StudentApplicationDetail> {
  if (!payload.admission_cycle_id) {
    throw new Error("No active admission cycle selected.");
  }

  if (!payload.application_type_id) {
    throw new Error("No application type selected.");
  }

  const body = {
    application_type_id: payload.application_type_id,
    admission_cycle_id: payload.admission_cycle_id,
    ...(payload.program_id ? { program_id: payload.program_id } : {}),
    ...(payload.student_notes ? { student_notes: payload.student_notes } : {}),
  };
  const response = await apiClient.post(ENDPOINTS.student.applications, body);
  const raw = extractResource<BackendApplicationRaw>(response.data);
  return adaptBackendApplication(raw);
}

export async function getStudentApplicationById(
  id: string | number
): Promise<StudentApplicationDetail> {
  const response = await apiClient.get(ENDPOINTS.student.applicationDetail(id));
  const raw = extractResource<BackendApplicationRaw>(response.data);
  return adaptBackendApplication(raw);
}

export async function updateStudentApplication(
  id: string | number,
  payload: Partial<ApplicationPayload>
): Promise<StudentApplicationDetail> {
  const response = await apiClient.put(ENDPOINTS.student.updateApplication(id), payload);
  const raw = extractResource<BackendApplicationRaw>(response.data);
  return adaptBackendApplication(raw);
}

export async function updateApplicationPreferences(
  id: string | number,
  preferences: (string | number)[] | ApplicationPreference[]
): Promise<void> {
  const program_ids = Array.isArray(preferences)
    ? preferences.map((p) => (typeof p === "object" && p !== null && "programId" in p ? p.programId : p))
    : [];

  await apiClient.put(ENDPOINTS.student.updatePreferences(id), { program_ids });
}

export async function submitStudentApplication(
  id: string | number,
  checklist?: { document_type_id: string | number; pledge: boolean }[]
): Promise<StudentApplicationDetail> {
  const payload = checklist ? { checklist } : undefined;
  const response = await apiClient.post(ENDPOINTS.student.submitApplication(id), payload);
  const raw = extractResource<BackendApplicationRaw>(response.data);
  return adaptBackendApplication(raw);
}

export type ApplicationDocumentChecklistItem = {
  id: string | number;
  documentTypeId: string | number;
  documentTypeName: string;
  displayNameAr?: string;
  displayNameEn?: string;
  isRequired: boolean;
  isUploaded: boolean;
  satisfied: boolean;
  documentId?: string | number;
  aiStatus?: "pending" | "verified" | "failed";
  canPledge?: boolean;
};

export function mapDocumentChecklistItem(item: Record<string, unknown>): ApplicationDocumentChecklistItem {
  const isSatisfied = Boolean(item.satisfied ?? item.is_uploaded ?? item.isUploaded ?? false);
  return {
    id: (item.id ?? item.document_type_id ?? item.documentTypeId ?? "") as string | number,
    documentTypeId: (item.document_type_id ?? item.documentTypeId ?? item.id ?? "") as string | number,
    documentTypeName: (item.name ?? item.display_name_ar ?? item.display_name_en ?? "") as string,
    displayNameAr: (item.display_name_ar ?? item.displayNameAr ?? item.name) as string | undefined,
    displayNameEn: (item.display_name_en ?? item.displayNameEn ?? item.name) as string | undefined,
    isRequired: Boolean(item.is_required ?? item.isRequired ?? true),
    isUploaded: isSatisfied,
    satisfied: isSatisfied,
    documentId: (item.document_id ?? item.documentId) as string | number | undefined,
    canPledge: Boolean(item.can_pledge ?? item.pledge_allowed ?? item.canPledge ?? false),
  };
}

export async function getApplicationDocumentChecklist(
  id: string | number
): Promise<ApplicationDocumentChecklistItem[]> {
  const response = await apiClient.get(ENDPOINTS.student.documentChecklist(id));
  const rawList = extractArray<Record<string, unknown>>(response.data);
  return rawList.map(mapDocumentChecklistItem);
}

// Backward compatibility helper functions
export async function getMyApplication(): Promise<StudentApplicationDetail | null> {
  try {
    const list = await getStudentApplications();
    return list[0] || null;
  } catch {
    return null;
  }
}

export async function saveApplicationDraft(payload: ApplicationPayload): Promise<StudentApplicationDetail> {
  return createStudentApplication(payload);
}

export async function submitApplication(payload: ApplicationPayload): Promise<StudentApplicationDetail> {
  const draft = await createStudentApplication(payload);
  return submitStudentApplication(draft.id);
}

export async function getApplicationStatus(): Promise<StudentApplicationDetail | null> {
  return getMyApplication();
}
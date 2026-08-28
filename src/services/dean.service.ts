import { apiClient, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type DeanStatistics = {
  total_users?: number;
  total_students?: number;
  total_applications?: number;
  total_documents?: number;
  total_programs?: number;
  total_departments?: number;
  total_faculties?: number;
  total_admission_cycles?: number;
  pending_applications?: number;
  under_review_applications?: number;
  returned_for_revision_applications?: number;
  accepted_applications?: number;
  rejected_applications?: number;
};

export type DeanDashboardStats = {
  statistics: DeanStatistics;
};

export async function getDeanDashboardStats(): Promise<DeanDashboardStats> {
  const response = await apiClient.get<DeanDashboardStats>(
    ENDPOINTS.admissionDean.dashboard
  );
  return extractResource<DeanDashboardStats>(response.data);
}

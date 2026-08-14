import { apiClient, unwrapRootResponse } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type DeanDashboardStats = {
  totalApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  facultiesCount: number;
  programsCount: number;
  recentApplications?: {
    id: string | number;
    applicationNo: string;
    studentName: string;
    program: string;
    status: string;
    submittedAt: string;
  }[];
};

export async function getDeanDashboardStats(): Promise<DeanDashboardStats> {
  const response = await apiClient.get<DeanDashboardStats>(
    ENDPOINTS.admissionDean.dashboard
  );
  return unwrapRootResponse<DeanDashboardStats>(response.data);
}

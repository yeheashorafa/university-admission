import { apiClient, extractArray } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type ReportLabelCount = { label: string; count: number };
export type ReportTimeInStatus = {
  label: string;
  average_seconds: number;
  average_minutes: number;
};
export type ReportDateCount = { date: string; count: number };
export type ReportAcceptanceRate = {
  label: string;
  total: number;
  accepted: number;
  rate: number;
};

export type ReportDateRange = { from?: string; to?: string };

function buildParams(range?: ReportDateRange) {
  const params: Record<string, string> = {};
  if (range?.from) params.from = range.from;
  if (range?.to) params.to = range.to;
  return params;
}

export async function getAdminReportByStatus(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.admin.reports.byStatus, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getAdminReportByFaculty(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.admin.reports.byFaculty, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getAdminReportByDepartment(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.admin.reports.byDepartment, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getAdminReportByProgram(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.admin.reports.byProgram, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getAdminReportTimeInStatus(
  range?: ReportDateRange
): Promise<ReportTimeInStatus[]> {
  const response = await apiClient.get<
    ReportTimeInStatus[] | { data: ReportTimeInStatus[] }
  >(ENDPOINTS.admin.reports.timeInStatus, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getAdminReportUploadVolume(
  range?: ReportDateRange
): Promise<ReportDateCount[]> {
  const response = await apiClient.get<
    ReportDateCount[] | { data: ReportDateCount[] }
  >(ENDPOINTS.admin.reports.uploadVolume, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getAdminReportAcceptanceRate(
  range?: ReportDateRange
): Promise<ReportAcceptanceRate[]> {
  const response = await apiClient.get<
    ReportAcceptanceRate[] | { data: ReportAcceptanceRate[] }
  >(ENDPOINTS.admin.reports.acceptanceRate, { params: buildParams(range) });
  return extractArray(response.data);
}

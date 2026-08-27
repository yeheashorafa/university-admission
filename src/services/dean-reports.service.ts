import { apiClient, extractArray } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ReportAcceptanceRate,
  ReportDateCount,
  ReportDateRange,
  ReportLabelCount,
  ReportTimeInStatus,
} from "@/services/admin-reports.service";

function buildParams(range?: ReportDateRange) {
  const params: Record<string, string> = {};
  if (range?.from) params.from = range.from;
  if (range?.to) params.to = range.to;
  return params;
}

export async function getDeanReportByStatus(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.admissionDean.reports.byStatus, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getDeanReportByFaculty(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.admissionDean.reports.byFaculty, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getDeanReportByDepartment(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.admissionDean.reports.byDepartment, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getDeanReportByProgram(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.admissionDean.reports.byProgram, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getDeanReportTimeInStatus(
  range?: ReportDateRange
): Promise<ReportTimeInStatus[]> {
  const response = await apiClient.get<
    ReportTimeInStatus[] | { data: ReportTimeInStatus[] }
  >(ENDPOINTS.admissionDean.reports.timeInStatus, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getDeanReportUploadVolume(
  range?: ReportDateRange
): Promise<ReportDateCount[]> {
  const response = await apiClient.get<
    ReportDateCount[] | { data: ReportDateCount[] }
  >(ENDPOINTS.admissionDean.reports.uploadVolume, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getDeanReportAcceptanceRate(
  range?: ReportDateRange
): Promise<ReportAcceptanceRate[]> {
  const response = await apiClient.get<
    ReportAcceptanceRate[] | { data: ReportAcceptanceRate[] }
  >(ENDPOINTS.admissionDean.reports.acceptanceRate, { params: buildParams(range) });
  return extractArray(response.data);
}

import { apiClient, extractArray } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ReportAcceptanceRate,
  ReportDateCount,
  ReportDateRange,
  ReportLabelCount,
} from "@/services/admin-reports.service";

export type HeadReportMetric = { label: string; value: number };

function buildParams(range?: ReportDateRange) {
  const params: Record<string, string> = {};
  if (range?.from) params.from = range.from;
  if (range?.to) params.to = range.to;
  return params;
}

export async function getHeadReportByStatus(
  range?: ReportDateRange
): Promise<ReportLabelCount[]> {
  const response = await apiClient.get<
    ReportLabelCount[] | { data: ReportLabelCount[] }
  >(ENDPOINTS.departmentHead.reports.byStatus, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getHeadReportThroughput(
  range?: ReportDateRange
): Promise<ReportDateCount[]> {
  const response = await apiClient.get<
    ReportDateCount[] | { data: ReportDateCount[] }
  >(ENDPOINTS.departmentHead.reports.throughput, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getHeadReportTimeToDecision(
  range?: ReportDateRange
): Promise<HeadReportMetric[]> {
  const response = await apiClient.get<
    HeadReportMetric[] | { data: HeadReportMetric[] }
  >(ENDPOINTS.departmentHead.reports.timeToDecision, { params: buildParams(range) });
  return extractArray(response.data);
}

export async function getHeadReportAcceptanceRate(
  range?: ReportDateRange
): Promise<ReportAcceptanceRate[]> {
  const response = await apiClient.get<
    ReportAcceptanceRate[] | { data: ReportAcceptanceRate[] }
  >(ENDPOINTS.departmentHead.reports.acceptanceRate, { params: buildParams(range) });
  return extractArray(response.data);
}

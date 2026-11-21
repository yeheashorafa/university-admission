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
  rejected: number;
  rate: number | null;
  numerator?: number;
  denominator?: number;
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


export type AcceptanceRateReport = {
  rows: ReportAcceptanceRate[];
  snapshot?: {
    generatedAt: string;
    periodStart: string;
    periodEnd: string;
  };
};

type ReportAudience = "admin" | "admissionDean";

type AcceptanceRateResponse = {
  data: ReportAcceptanceRate[];
  snapshot?: boolean;
  generated_at?: string;
  period_start?: string;
  period_end?: string;
};

export async function getAcceptanceRateReport(
  audience: ReportAudience,
  range?: ReportDateRange
): Promise<AcceptanceRateReport> {
  const { data } = await apiClient.get<AcceptanceRateResponse | ReportAcceptanceRate[]>(
    ENDPOINTS[audience].reports.acceptanceRate,
    { params: buildParams(range) }
  );
  const rows = extractArray<ReportAcceptanceRate>(data);
  if (!Array.isArray(data) && data?.snapshot !== false && data?.generated_at &&
      data.period_start && data.period_end) {
    return {
      rows,
      snapshot: {
        generatedAt: data.generated_at,
        periodStart: data.period_start,
        periodEnd: data.period_end,
      },
    };
  }
  return { rows };
}

export function getAdminReportAcceptanceRate(range?: ReportDateRange) {
  return getAcceptanceRateReport("admin", range);
}

export async function exportAcceptanceRateReport(
  audience: ReportAudience,
  range?: ReportDateRange
): Promise<{ blob: Blob; filename: string }> {
  const response = await apiClient.get<Blob>(ENDPOINTS[audience].reports.acceptanceRate, {
    params: { ...buildParams(range), format: "xlsx" },
    responseType: "blob",
    headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  });
  const disposition = response.headers["content-disposition"];
  const filename = typeof disposition === "string"
    ? /filename="?([\w.-]+\.xlsx)"?(?:;|$)/i.exec(disposition)?.[1]
    : undefined;
  const period = [range?.from, range?.to].filter(Boolean).join("-");
  return {
    blob: response.data,
    filename: filename ?? (period ? `acceptance-rate-${period}.xlsx` : "acceptance-rate.xlsx"),
  };
}

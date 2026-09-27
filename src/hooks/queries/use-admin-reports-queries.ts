"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminReportByFaculty,
  getAdminReportByStatus,
  getAdminReportByDepartment,
  getAdminReportByProgram,
  getAdminReportTimeInStatus,
  getAdminReportUploadVolume,
  getAdminReportAcceptanceRate,
  type ReportDateRange,
  type ReportLabelCount,
  type ReportTimeInStatus,
  type ReportDateCount,
  type ReportAcceptanceRate,
} from "@/services/admin-reports.service";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { isAdminRole } from "@/constants/roles";

export type AdminReportsData = {
  byStatus: ReportLabelCount[] | null;
  byFaculty: ReportLabelCount[] | null;
  byDepartment: ReportLabelCount[] | null;
  byProgram: ReportLabelCount[] | null;
  timeInStatus: ReportTimeInStatus[] | null;
  uploadVolume: ReportDateCount[] | null;
  acceptanceRate: ReportAcceptanceRate[] | null;
};

export function useAdminReportsQuery(range?: ReportDateRange) {
  const { isHydrated, token, user, role } = useCurrentAuth();

  const isEnabled = Boolean(isHydrated && token && user && isAdminRole(role));

  return useQuery({
    queryKey: ["admin", "reports", range?.from ?? "all", range?.to ?? "all"],
    queryFn: async (): Promise<AdminReportsData> => {
      const results = await Promise.allSettled([
        getAdminReportByStatus(range),
        getAdminReportByFaculty(range),
        getAdminReportByDepartment(range),
        getAdminReportByProgram(range),
        getAdminReportTimeInStatus(range),
        getAdminReportUploadVolume(range),
        getAdminReportAcceptanceRate(range),
      ]);

      const safeValue = <T>(res: PromiseSettledResult<T>, fallback: T): T => {
        if (res.status === "fulfilled") return res.value;
        console.error("Report endpoint failed:", res.reason);
        return fallback;
      };

      return {
        byStatus: safeValue(results[0], null),
        byFaculty: safeValue(results[1], null),
        byDepartment: safeValue(results[2], null),
        byProgram: safeValue(results[3], null),
        timeInStatus: safeValue(results[4], null),
        uploadVolume: safeValue(results[5], null),
        acceptanceRate: safeValue(results[6], null),
      };
    },
    enabled: isEnabled,
    retry: false,
  });
}

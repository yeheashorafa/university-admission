"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDeanReportAcceptanceRate,
  getDeanReportByDepartment,
  getDeanReportByFaculty,
  getDeanReportByProgram,
  getDeanReportByStatus,
  getDeanReportTimeInStatus,
  getDeanReportUploadVolume,
} from "@/services/dean-reports.service";
import type { ReportDateRange } from "@/services/admin-reports.service";
import type {
  ReportAcceptanceRate,
  ReportDateCount,
  ReportLabelCount,
  ReportTimeInStatus,
} from "@/services/admin-reports.service";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { isAdmissionDean } from "@/constants/roles";

export type DeanReportsData = {
  byStatus: ReportLabelCount[] | null;
  byFaculty: ReportLabelCount[] | null;
  byDepartment: ReportLabelCount[] | null;
  byProgram: ReportLabelCount[] | null;
  timeInStatus: ReportTimeInStatus[] | null;
  uploadVolume: ReportDateCount[] | null;
  acceptanceRate: ReportAcceptanceRate[] | null;
};

export function useDeanReportsQuery(range?: ReportDateRange) {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isEnabled = Boolean(isHydrated && token && user && isAdmissionDean(role));

  return useQuery({
    queryKey: ["admissionDean", "reports", range?.from ?? "all", range?.to ?? "all"],
    queryFn: async (): Promise<DeanReportsData> => {
      const results = await Promise.allSettled([
        getDeanReportByStatus(range),
        getDeanReportByFaculty(range),
        getDeanReportByDepartment(range),
        getDeanReportByProgram(range),
        getDeanReportTimeInStatus(range),
        getDeanReportUploadVolume(range),
        getDeanReportAcceptanceRate(range),
      ]);

      const safeValue = <T>(res: PromiseSettledResult<T>, fallback: T): T => {
        if (res.status === "fulfilled") return res.value;
        console.error("Dean report endpoint failed:", res.reason);
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

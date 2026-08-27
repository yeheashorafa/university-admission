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
import { useAuthStore } from "@/stores/auth.store";
import { isAdmissionDean } from "@/constants/roles";

export type DeanReportsData = {
  byStatus: ReportLabelCount[];
  byFaculty: ReportLabelCount[];
  byDepartment: ReportLabelCount[];
  byProgram: ReportLabelCount[];
  timeInStatus: ReportTimeInStatus[];
  uploadVolume: ReportDateCount[];
  acceptanceRate: ReportAcceptanceRate[];
};

export function useDeanReportsQuery(range?: ReportDateRange) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(hasHydrated && token && user && isAdmissionDean(role));

  return useQuery({
    queryKey: ["admissionDean", "reports", range?.from ?? "all", range?.to ?? "all"],
    queryFn: async (): Promise<DeanReportsData> => {
      const [
        byStatus,
        byFaculty,
        byDepartment,
        byProgram,
        timeInStatus,
        uploadVolume,
        acceptanceRate,
      ] = await Promise.all([
        getDeanReportByStatus(range),
        getDeanReportByFaculty(range),
        getDeanReportByDepartment(range),
        getDeanReportByProgram(range),
        getDeanReportTimeInStatus(range),
        getDeanReportUploadVolume(range),
        getDeanReportAcceptanceRate(range),
      ]);
      return {
        byStatus,
        byFaculty,
        byDepartment,
        byProgram,
        timeInStatus,
        uploadVolume,
        acceptanceRate,
      };
    },
    enabled: isEnabled,
    retry: false,
  });
}

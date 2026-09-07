"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getHeadReportAcceptanceRate,
  getHeadReportByStatus,
  getHeadReportThroughput,
  getHeadReportTimeToDecision,
  type HeadReportMetric,
} from "@/services/head-reports.service";
import type { ReportDateRange } from "@/services/admin-reports.service";
import type {
  ReportAcceptanceRate,
  ReportDateCount,
  ReportLabelCount,
} from "@/services/admin-reports.service";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { isDepartmentHead } from "@/constants/roles";

export type HeadReportsData = {
  byStatus: ReportLabelCount[];
  throughput: ReportDateCount[];
  timeToDecision: HeadReportMetric[];
  acceptanceRate: ReportAcceptanceRate[];
};

export function useHeadReportsQuery(range?: ReportDateRange) {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isEnabled = Boolean(
    isHydrated && token && user && isDepartmentHead(role)
  );

  return useQuery({
    queryKey: ["departmentHead", "reports", range?.from ?? "all", range?.to ?? "all"],
    queryFn: async (): Promise<HeadReportsData> => {
      const [byStatus, throughput, timeToDecision, acceptanceRate] =
        await Promise.all([
          getHeadReportByStatus(range),
          getHeadReportThroughput(range),
          getHeadReportTimeToDecision(range),
          getHeadReportAcceptanceRate(range),
        ]);
      return { byStatus, throughput, timeToDecision, acceptanceRate };
    },
    enabled: isEnabled,
    retry: false,
  });
}

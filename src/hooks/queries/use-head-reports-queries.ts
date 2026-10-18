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
  byStatus: ReportLabelCount[] | null;
  throughput: ReportDateCount[] | null;
  timeToDecision: HeadReportMetric[] | null;
  acceptanceRate: ReportAcceptanceRate[] | null;
};

export function useHeadReportsQuery(range?: ReportDateRange) {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isEnabled = Boolean(
    isHydrated && token && user && isDepartmentHead(role)
  );

  return useQuery({
    queryKey: ["departmentHead", "reports", range?.from ?? "all", range?.to ?? "all"],
    queryFn: async (): Promise<HeadReportsData> => {
      const results = await Promise.allSettled([
        getHeadReportByStatus(range),
        getHeadReportThroughput(range),
        getHeadReportTimeToDecision(range),
        getHeadReportAcceptanceRate(range),
      ]);

      const safeValue = <T>(res: PromiseSettledResult<T>, fallback: T): T => {
        if (res.status === "fulfilled") return res.value;
        console.error("Head report endpoint failed:", res.reason);
        return fallback;
      };

      return {
        byStatus: safeValue(results[0], null),
        throughput: safeValue(results[1], null),
        timeToDecision: safeValue(results[2], null),
        acceptanceRate: safeValue(results[3], null),
      };
    },
    enabled: isEnabled,
    retry: false,
  });
}

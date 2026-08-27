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
import { useAuthStore } from "@/stores/auth.store";
import { isDepartmentHead } from "@/constants/roles";

export type HeadReportsData = {
  byStatus: ReportLabelCount[];
  throughput: ReportDateCount[];
  timeToDecision: HeadReportMetric[];
  acceptanceRate: ReportAcceptanceRate[];
};

export function useHeadReportsQuery(range?: ReportDateRange) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(
    hasHydrated && token && user && isDepartmentHead(role)
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

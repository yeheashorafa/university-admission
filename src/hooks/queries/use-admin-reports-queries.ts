"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminReportByFaculty,
  getAdminReportByStatus,
  type ReportDateRange,
  type ReportLabelCount,
} from "@/services/admin-reports.service";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/constants/roles";

export type AdminReportsData = {
  byStatus: ReportLabelCount[];
  byFaculty: ReportLabelCount[];
};

export function useAdminReportsQuery(range?: ReportDateRange) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(hasHydrated && token && user && isAdminRole(role));

  return useQuery({
    queryKey: ["admin", "reports", range?.from ?? "all", range?.to ?? "all"],
    queryFn: async (): Promise<AdminReportsData> => {
      const [byStatus, byFaculty] = await Promise.all([
        getAdminReportByStatus(range),
        getAdminReportByFaculty(range),
      ]);
      return { byStatus, byFaculty };
    },
    enabled: isEnabled,
    retry: false,
  });
}

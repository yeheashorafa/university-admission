import { useQuery } from "@tanstack/react-query";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { queryKeys } from "@/constants/query-keys";
import { getDeanDashboardStats } from "@/services/dean.service";

export function useDeanDashboardQuery(options?: { enabled?: boolean }) {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isDean = role === "admission_dean";
  const isEnabled =
    Boolean(isHydrated && token && user && isDean) && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.admin.deanDashboard,
    queryFn: getDeanDashboardStats,
    enabled: isEnabled,
    retry: false,
  });
}

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { queryKeys } from "@/constants/query-keys";
import { getDeanDashboardStats } from "@/services/dean.service";

export function useDeanDashboardQuery(options?: { enabled?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isDean = role === "admission_dean";
  const isEnabled =
    Boolean(hasHydrated && token && user && isDean) && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.admin.deanDashboard,
    queryFn: getDeanDashboardStats,
    enabled: isEnabled,
    retry: false,
  });
}

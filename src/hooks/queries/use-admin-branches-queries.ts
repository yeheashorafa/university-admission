"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminBranches } from "@/services/admin-branches.service";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/constants/roles";

export function useAdminBranchesQuery() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(hasHydrated && token && user && isAdminRole(role));

  return useQuery({
    queryKey: ["admin", "branches"],
    queryFn: getAdminBranches,
    enabled: isEnabled,
    retry: false,
  });
}

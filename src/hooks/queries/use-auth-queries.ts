"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getCurrentUser } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export function useCurrentUserQuery() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: getCurrentUser,
    enabled: Boolean(hasHydrated && token),
    retry: false,
  });
}
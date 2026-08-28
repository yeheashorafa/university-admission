"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminBranches, createAdminBranch, updateAdminBranch, deleteAdminBranch } from "@/services/admin-branches.service";
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

export function useCreateAdminBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "branches"] });
    },
  });
}

export function useUpdateAdminBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, payload }: { branchId: string | number; payload: Parameters<typeof updateAdminBranch>[1] }) =>
      updateAdminBranch(branchId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "branches"] });
    },
  });
}

export function useDeleteAdminBranchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "branches"] });
    },
  });
}

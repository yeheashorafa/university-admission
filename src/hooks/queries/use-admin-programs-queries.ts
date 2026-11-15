"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  createAdminProgram,
  deleteAdminProgram,
  getAdminPrograms,
  getAllAdminPrograms,
  getAdminProgramCatalogDetails,
  updateAdminProgramCatalogDetails,
  type AdminProgramDetailsPayload,
  updateAdminProgram,
  type AdminProgramPayload,
} from "@/services/admin-programs.service";

import { useCurrentAuth } from "@/hooks/use-current-auth";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/constants/roles";

type AdminProgramsParams = {
  page?: number;
  search?: string;
  faculty?: string;
  status?: string;
};

export function useAdminProgramsQuery(params?: AdminProgramsParams) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(hasHydrated && token && user && isAdminRole(role));

  return useQuery({
    queryKey: queryKeys.admin.programs(params),
    queryFn: () => getAdminPrograms(params),
    enabled: isEnabled,
    retry: false,
  });
}

export function useCreateAdminProgramMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminProgramPayload) => createAdminProgram(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "programs"],
      });
    },
  });
}

export function useUpdateAdminProgramMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      payload,
    }: {
      programId: string;
      payload: Partial<AdminProgramPayload>;
    }) => updateAdminProgram(programId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "programs"],
      });
    },
  });
}

export function useDeleteAdminProgramMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => deleteAdminProgram(programId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "programs"],
      });
    },
  });
}

export function useAllAdminProgramsQuery(options?: { enabled?: boolean }) {
  const { user, token, role, isHydrated } = useCurrentAuth();
  const isEnabled = Boolean(
    options?.enabled !== false &&
      isHydrated &&
      token &&
      user &&
      isAdminRole(role),
  );
  const query = useQuery({
    queryKey: queryKeys.programs.list({ scope: "admin" }),
    queryFn: getAllAdminPrograms,
    enabled: isEnabled,
    retry: false,
  });

  return { ...query, isEnabled, isAuthHydrated: isHydrated };
}

export function useUpdateAdminProgramCatalogDetailsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      programId,
      payload,
    }: {
      programId: string | number;
      payload: AdminProgramDetailsPayload;
    }) => updateAdminProgramCatalogDetails(programId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.programs.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "programs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "program-catalog-details"] });
    },
  });
}

export function useAdminProgramCatalogDetailsQuery(programId?: string) {
  const { user, token, role, isHydrated } = useCurrentAuth();
  const isEnabled = Boolean(programId && isHydrated && token && user && isAdminRole(role));
  const query = useQuery({
    queryKey: ["admin", "program-catalog-details", programId],
    queryFn: () => getAdminProgramCatalogDetails(programId ?? ""),
    enabled: isEnabled,
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
  return { ...query, isEnabled, isAuthHydrated: isHydrated };
}

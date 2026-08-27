"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  createAdminApplicationType,
  deleteAdminApplicationType,
  getAdminApplicationTypes,
  updateAdminApplicationType,
  type AdminApplicationTypePayload,
} from "@/services/admin.service";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/constants/roles";

export function useAdminApplicationTypesQuery() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(hasHydrated && token && user && isAdminRole(role));

  return useQuery({
    queryKey: queryKeys.admin.applicationTypes(),
    queryFn: getAdminApplicationTypes,
    enabled: isEnabled,
    retry: false,
  });
}

export function useCreateAdminApplicationTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminApplicationTypePayload) =>
      createAdminApplicationType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.applicationTypes(),
      });
    },
  });
}

export function useUpdateAdminApplicationTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      applicationTypeId,
      payload,
    }: {
      applicationTypeId: string | number;
      payload: Partial<AdminApplicationTypePayload>;
    }) => updateAdminApplicationType(applicationTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.applicationTypes(),
      });
    },
  });
}

export function useDeleteAdminApplicationTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationTypeId: string | number) =>
      deleteAdminApplicationType(applicationTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.applicationTypes(),
      });
    },
  });
}

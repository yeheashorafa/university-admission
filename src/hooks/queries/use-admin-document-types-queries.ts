"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  createAdminDocumentType,
  deleteAdminDocumentType,
  getAdminDocumentTypes,
  updateAdminDocumentType,
  type AdminDocumentTypePayload,
} from "@/services/admin.service";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/constants/roles";

export function useAdminDocumentTypesQuery() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(hasHydrated && token && user && isAdminRole(role));

  return useQuery({
    queryKey: queryKeys.admin.documentTypes(),
    queryFn: getAdminDocumentTypes,
    enabled: isEnabled,
    retry: false,
  });
}

export function useCreateAdminDocumentTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminDocumentTypePayload) =>
      createAdminDocumentType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.documentTypes() });
    },
  });
}

export function useUpdateAdminDocumentTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentTypeId,
      payload,
    }: {
      documentTypeId: string | number;
      payload: Partial<AdminDocumentTypePayload>;
    }) => updateAdminDocumentType(documentTypeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.documentTypes() });
    },
  });
}

export function useDeleteAdminDocumentTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentTypeId: string | number) =>
      deleteAdminDocumentType(documentTypeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.documentTypes() });
    },
  });
}

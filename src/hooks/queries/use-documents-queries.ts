"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  deleteDocument,
  getMyDocuments,
  uploadDocument,
} from "@/services/documents.service";

import { useAuthStore } from "@/stores/auth.store";

export function useMyDocumentsQuery() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(hasHydrated && token && user && role === "student");

  return useQuery({
    queryKey: queryKeys.documents.myDocuments,
    queryFn: getMyDocuments,
    enabled: isEnabled,
    retry: false,
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentType,
      file,
    }: {
      documentType: string;
      file: File;
    }) => uploadDocument(documentType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.myDocuments,
      });
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.documents.myDocuments,
      });
    },
  });
}
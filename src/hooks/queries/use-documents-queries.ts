"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  deleteDocument,
  getMyDocuments,
  uploadDocument,
} from "@/services/documents.service";

import { useCurrentAuth } from "@/hooks/use-current-auth";

export function useMyDocumentsQuery() {
  const { token, role, isHydrated } = useCurrentAuth();

  const isEnabled = Boolean(isHydrated && token && role === "student");

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
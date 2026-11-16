"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  activateAiProvider, createAiProvider, deleteAiProvider, getAiProviders,
  testAiProvider, updateAiProvider, type AiProviderPayload,
} from "@/services/admin-ai-providers.service";

export function useAdminAiProvidersQuery() {
  const { role, token, isHydrated } = useCurrentAuth();
  return useQuery({
    queryKey: queryKeys.admin.aiProviders,
    queryFn: getAiProviders,
    enabled: Boolean(isHydrated && token && role === "admin"),
    retry: false,
  });
}

function useProviderMutation<T, TVariables>(mutationFn: (variables: TVariables) => Promise<T>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.admin.aiProviders }),
  });
}

// Only the sanitized request result reaches React Query. The key is never a mutation variable.
export function useCreateAiProviderMutation() {
  const mutation = useProviderMutation((request: ReturnType<typeof createAiProvider>) => request);
  return { isPending: mutation.isPending, save: (payload: AiProviderPayload) => mutation.mutateAsync(createAiProvider(payload)) };
}

export function useUpdateAiProviderMutation() {
  const mutation = useProviderMutation((request: ReturnType<typeof updateAiProvider>) => request);
  return { isPending: mutation.isPending, save: (id: number, payload: AiProviderPayload) => mutation.mutateAsync(updateAiProvider(id, payload)) };
}

export function useTestAiProviderMutation() {
  return useProviderMutation(testAiProvider);
}

export function useActivateAiProviderMutation() {
  return useProviderMutation(activateAiProvider);
}

export function useDeleteAiProviderMutation() {
  return useProviderMutation(deleteAiProvider);
}

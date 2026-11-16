"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  getStudentAiConsent,
  grantStudentAiConsent,
  withdrawStudentAiConsent,
} from "@/services/ai-consent.service";

export function useStudentAiConsent() {
  const { user, token, role, isHydrated } = useCurrentAuth();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.student.aiConsent(user?.id);
  const enabled = Boolean(isHydrated && token && user && role === "student");
  const query = useQuery({
    queryKey,
    queryFn: getStudentAiConsent,
    enabled,
    retry: false,
  });

  const refreshConsent = () => queryClient.invalidateQueries({ queryKey, exact: true });
  const refreshDocuments = () => queryClient.invalidateQueries({
    queryKey: queryKeys.documents.myDocuments,
  });

  const grant = useMutation({
    mutationFn: grantStudentAiConsent,
    onSettled: (_data, error) => Promise.all([
      refreshConsent(),
      ...(error ? [] : [refreshDocuments()]),
    ]),
  });

  const withdraw = useMutation({
    mutationFn: withdrawStudentAiConsent,
    onSettled: refreshConsent,
  });

  return { query, grant, withdraw, enabled };
}

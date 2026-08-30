"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getApplicationDocumentChecklist,
  getApplicationStatus,
  getMyApplication,
  getStudentApplicationById,
  getStudentApplications,
  getStudentDashboard,
  saveApplicationDraft,
  submitApplication,
  type ApplicationPayload,
} from "@/services/application.service";

import { isUserVerified } from "@/services/auth.service";
import { useCurrentAuth } from "@/hooks/use-current-auth";

function useStudentQueryGuard(extraCondition: boolean = true) {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isUnverified = user ? isUserVerified(user) === false : false;

  return Boolean(isHydrated && token && role === "student" && !isUnverified && extraCondition);
}

export function useStudentDashboardQuery() {
  const isEnabled = useStudentQueryGuard();
  return useQuery({
    queryKey: queryKeys.student.dashboard,
    queryFn: getStudentDashboard,
    enabled: isEnabled,
    retry: false,
  });
}

export function useStudentApplicationsQuery() {
  const isEnabled = useStudentQueryGuard();
  return useQuery({
    queryKey: queryKeys.student.applications,
    queryFn: getStudentApplications,
    enabled: isEnabled,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useStudentApplicationDetailsQuery(id?: string | number) {
  const isEnabled = useStudentQueryGuard(Boolean(id));
  return useQuery({
    queryKey: queryKeys.student.applicationDetail(id ?? ""),
    queryFn: () => (id ? getStudentApplicationById(id) : Promise.resolve(null)),
    enabled: isEnabled,
    retry: false,
  });
}

export function useApplicationDocumentChecklistQuery(id?: string | number) {
  const isEnabled = useStudentQueryGuard(Boolean(id));
  return useQuery({
    queryKey: queryKeys.student.documentChecklist(id ?? ""),
    queryFn: () => (id ? getApplicationDocumentChecklist(id) : Promise.resolve([])),
    enabled: isEnabled,
    retry: false,
  });
}

export function useMyApplicationQuery() {
  const isEnabled = useStudentQueryGuard();
  return useQuery({
    queryKey: queryKeys.application.myApplication,
    queryFn: getMyApplication,
    enabled: isEnabled,
    retry: false,
  });
}

export function useApplicationStatusQuery() {
  const isEnabled = useStudentQueryGuard();
  return useQuery({
    queryKey: queryKeys.application.status,
    queryFn: getApplicationStatus,
    enabled: isEnabled,
    retry: false,
  });
}

export function useSaveApplicationDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApplicationPayload) => saveApplicationDraft(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.application.myApplication,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.application.status,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.applications,
      });
    },
  });
}

export function useSubmitApplicationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApplicationPayload) => submitApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.application.myApplication,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.application.status,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.student.applications,
      });
    },
  });
}
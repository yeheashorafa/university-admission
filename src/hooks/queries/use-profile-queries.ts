"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  changePassword,
  getMyProfile,
  updateMyProfile,
  type UpdateProfilePayload,
} from "@/services/profile.service";

import { isUserVerified } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export function useMyProfileQuery() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isUnverified = isUserVerified(user) === false;
  const isEnabled = Boolean(hasHydrated && token && user && !isUnverified);

  if (process.env.NODE_ENV === "development") {
    console.log("[useMyProfileQuery] enabled state:", {
      hasHydrated,
      hasToken: !!token,
      hasUser: !!user,
      isUnverified,
      isEnabled,
    });
  }

  return useQuery({
    queryKey: queryKeys.profile.myProfile,
    queryFn: getMyProfile,
    enabled: isEnabled,
    retry: false,
  });
}

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.myProfile,
      });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword,
  });
}
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
import { useCurrentAuth } from "@/hooks/use-current-auth";

export function useMyProfileQuery() {
  const { user, token, isHydrated } = useCurrentAuth();

  const isUnverified = user ? isUserVerified(user) === false : false;
  const isEnabled = Boolean(isHydrated && token && !isUnverified);

  if (process.env.NODE_ENV === "development") {
    console.log("[useMyProfileQuery] enabled state:", {
      isHydrated,
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
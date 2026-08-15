"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getSocialInformation,
  updateSocialInformation,
  type SocialInformation,
} from "@/services/social-information.service";

import { isUserVerified } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export function useSocialInformationQuery() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isUnverified = isUserVerified(user) === false;
  const isEnabled = Boolean(hasHydrated && token && user && role === "student" && !isUnverified);

  return useQuery({
    queryKey: queryKeys.socialInformation.mySocialInformation,
    queryFn: getSocialInformation,
    enabled: isEnabled,
    retry: false,
  });
}

export function useUpdateSocialInformationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<SocialInformation>) => updateSocialInformation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.socialInformation.mySocialInformation,
      });
    },
  });
}

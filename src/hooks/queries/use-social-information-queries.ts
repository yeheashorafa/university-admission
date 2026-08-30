"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getSocialInformation,
  updateSocialInformation,
  type SocialInformation,
} from "@/services/social-information.service";

import { isUserVerified } from "@/services/auth.service";
import { useCurrentAuth } from "@/hooks/use-current-auth";

export function useSocialInformationQuery() {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isUnverified = user ? isUserVerified(user) === false : false;
  const isEnabled = Boolean(isHydrated && token && role === "student" && !isUnverified);

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

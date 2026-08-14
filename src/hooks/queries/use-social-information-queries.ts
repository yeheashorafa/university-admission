"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getSocialInformation,
  updateSocialInformation,
  type SocialInformation,
} from "@/services/social-information.service";

import { useAuthStore } from "@/stores/auth.store";

export function useSocialInformationQuery() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEnabled = Boolean(hasHydrated && token && user && role === "student");

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

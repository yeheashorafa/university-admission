"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getMySecondarySchoolRecord,
  updateMySecondarySchoolRecord,
  type SecondarySchoolRecord,
  type UpdateSecondarySchoolRecordPayload,
} from "@/services/student-secondary-school-records.service";

import { isUserVerified } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export function useMySecondarySchoolRecordQuery() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isUnverified = isUserVerified(user) === false;

  return useQuery({
    queryKey: queryKeys.profile.secondarySchoolRecord,
    queryFn: getMySecondarySchoolRecord,
    enabled: Boolean(
      hasHydrated && token && user && role === "student" && !isUnverified
    ),
    retry: false,
  });
}

export function useUpdateSecondarySchoolRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: UpdateSecondarySchoolRecordPayload;
    }) => updateMySecondarySchoolRecord(id, payload),
    onSuccess: (record: SecondarySchoolRecord) => {
      queryClient.setQueryData(
        queryKeys.profile.secondarySchoolRecord,
        record
      );
    },
  });
}

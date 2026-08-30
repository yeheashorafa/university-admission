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
import { useCurrentAuth } from "@/hooks/use-current-auth";

export function useMySecondarySchoolRecordQuery() {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isUnverified = user ? isUserVerified(user) === false : false;

  return useQuery({
    queryKey: queryKeys.profile.secondarySchoolRecord,
    queryFn: getMySecondarySchoolRecord,
    enabled: Boolean(
      isHydrated && token && role === "student" && !isUnverified
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

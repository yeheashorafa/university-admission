"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import type { UserRole } from "@/services/auth.service";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  type AdminUserPayload,
} from "@/services/admin-users.service";

import { useCurrentAuth } from "@/hooks/use-current-auth";
import { isAdminRole } from "@/constants/roles";

type AdminUsersParams = {
  page?: number;
  search?: string;
  role?: UserRole;
  status?: string;
};

export function useAdminUsersQuery(params?: AdminUsersParams) {
  const { isHydrated, token, user, role } = useCurrentAuth();

  const isEnabled = Boolean(isHydrated && token && user && isAdminRole(role));

  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => getAdminUsers(params),
    enabled: isEnabled,
    retry: false,
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUserPayload) => createAdminUser(payload),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: Partial<AdminUserPayload>;
    }) => updateAdminUser(userId, payload),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}
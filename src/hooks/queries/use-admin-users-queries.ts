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
import { isSuperAdmin } from "@/constants/roles";

type AdminUsersParams = {
  page?: number;
  search?: string;
  role?: UserRole;
  status?: string;
};

export function useAdminUsersQuery(params?: AdminUsersParams) {
  const { isHydrated, token, user, role } = useCurrentAuth();

  const isEnabled = Boolean(isHydrated && token && user && isSuperAdmin(role));

  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => getAdminUsers(params),
    enabled: isEnabled,
    retry: false,
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();
  const { role } = useCurrentAuth();

  return useMutation({
    mutationFn: (payload: AdminUserPayload) => {
      if (!isSuperAdmin(role)) {
        throw new Error("Unauthorized: Only super administrators can create users.");
      }
      return createAdminUser(payload);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();
  const { role } = useCurrentAuth();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: Partial<AdminUserPayload>;
    }) => {
      if (!isSuperAdmin(role)) {
        throw new Error("Unauthorized: Only super administrators can update users.");
      }
      return updateAdminUser(userId, payload);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  const { role } = useCurrentAuth();

  return useMutation({
    mutationFn: (userId: string) => {
      if (!isSuperAdmin(role)) {
        throw new Error("Unauthorized: Only super administrators can delete users.");
      }
      return deleteAdminUser(userId);
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ["admin", "users"],
      });
    },
  });
}
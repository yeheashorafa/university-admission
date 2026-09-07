import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { queryKeys } from "@/constants/query-keys";
import {
  getHeadNotifications,
  markHeadNotificationAsRead,
  markAllHeadNotificationsAsRead,
  deleteHeadNotification,
} from "@/services/head-notifications.service";

export function useHeadNotificationsQuery(options?: { enabled?: boolean }) {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isHead = role === "department_head";
  const isEnabled =
    Boolean(isHydrated && token && user && isHead) && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.departmentHead.notifications,
    queryFn: getHeadNotifications,
    enabled: isEnabled,
    retry: false,
  });
}

export function useMarkHeadNotificationAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => markHeadNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departmentHead.notifications });
    },
  });
}

export function useMarkAllHeadNotificationsAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllHeadNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departmentHead.notifications });
    },
  });
}

export function useDeleteHeadNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteHeadNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departmentHead.notifications });
    },
  });
}

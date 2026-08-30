import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getMyNotifications,
  getStaffNotifications,
  markAllNotificationsAsRead,
  markAllStaffNotificationsAsRead,
  markNotificationAsRead,
  markStaffNotificationAsRead,
  deleteNotification,
  deleteStaffNotification,
  type NotificationType,
} from "@/services/notifications.service";

import { useAuthStore } from "@/stores/auth.store";
import { useCurrentAuth } from "@/hooks/use-current-auth";

type NotificationsParams = {
  page?: number;
  type?: NotificationType;
  status?: "read" | "unread";
};

export function useMyNotificationsQuery(
  params?: NotificationsParams,
  options?: { enabled?: boolean }
) {
  const { token, role, isHydrated } = useCurrentAuth();

  const isStudent = role === "student";
  const isEnabled =
    Boolean(isHydrated && token && isStudent) &&
    (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.notifications.myNotifications(params),
    queryFn: () => getMyNotifications(params),
    enabled: isEnabled,
    retry: false,
  });
}

export function useStaffNotificationsQuery(params?: { page?: number }) {
  const { token, role, isHydrated } = useCurrentAuth();

  const isStaff = role === "admission_employee" || role === "department_head";
  const staffRole = role as "admission_employee" | "department_head";

  const isEnabled = Boolean(isHydrated && token && isStaff);

  return useQuery({
    queryKey: ["staff-notifications", role, params],
    queryFn: () => getStaffNotifications(staffRole, params),
    enabled: isEnabled,
    retry: false,
  });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string | number) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string | number) =>
      deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
}

export function useMarkStaffNotificationAsReadMutation() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role) as "admission_employee" | "department_head";

  return useMutation({
    mutationFn: (notificationId: string | number) =>
      markStaffNotificationAsRead(role, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff-notifications"],
      });
    },
  });
}

export function useMarkAllStaffNotificationsAsReadMutation() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role) as "admission_employee" | "department_head";

  return useMutation({
    mutationFn: () => markAllStaffNotificationsAsRead(role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff-notifications"],
      });
    },
  });
}

export function useDeleteStaffNotificationMutation() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role) as "admission_employee" | "department_head";

  return useMutation({
    mutationFn: (notificationId: string | number) =>
      deleteStaffNotification(role, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff-notifications"],
      });
    },
  });
}
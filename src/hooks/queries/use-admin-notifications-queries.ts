import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteAdminNotification,
} from "@/services/admin-notifications.service";

export function useAdminNotificationsQuery(options?: { enabled?: boolean }) {
  const { user, token, role, isHydrated } = useCurrentAuth();

  const isAdmin = role === "admin";
  const isEnabled = Boolean(isHydrated && token && user && isAdmin) && (options?.enabled ?? true);

  return useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: getAdminNotifications,
    enabled: isEnabled,
    retry: false,
  });
}

export function useMarkAdminNotificationAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => markAdminNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

export function useMarkAllAdminNotificationsAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAdminNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

export function useDeleteAdminNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteAdminNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

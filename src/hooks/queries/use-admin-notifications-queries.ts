import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteAdminNotification,
} from "@/services/admin-notifications.service";

export function useAdminNotificationsQuery() {
  return useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: getAdminNotifications,
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

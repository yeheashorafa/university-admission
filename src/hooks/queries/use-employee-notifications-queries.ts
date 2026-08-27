import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { queryKeys } from "@/constants/query-keys";
import {
  getEmployeeNotifications,
  markEmployeeNotificationAsRead,
  markAllEmployeeNotificationsAsRead,
  deleteEmployeeNotification,
} from "@/services/employee-notifications.service";

export function useEmployeeNotificationsQuery(options?: { enabled?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const isEmployee = role === "admission_employee";
  const isEnabled =
    Boolean(hasHydrated && token && user && isEmployee) && (options?.enabled ?? true);

  return useQuery({
    queryKey: queryKeys.employee.notifications,
    queryFn: getEmployeeNotifications,
    enabled: isEnabled,
    retry: false,
  });
}

export function useMarkEmployeeNotificationAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => markEmployeeNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employee.notifications });
    },
  });
}

export function useMarkAllEmployeeNotificationsAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllEmployeeNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employee.notifications });
    },
  });
}

export function useDeleteEmployeeNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteEmployeeNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employee.notifications });
    },
  });
}

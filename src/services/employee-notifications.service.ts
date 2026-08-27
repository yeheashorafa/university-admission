import { apiClient } from "@/lib/api/client";
import { extractArray } from "@/lib/api/response";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type FailedRowError = {
  row?: number;
  national_id?: string;
  errors?: string[] | string | Record<string, string[]>;
};

export type NotificationDataSummary = {
  total_rows?: number;
  matched?: number;
  pending?: number;
  failed?: number;
  failed_rows?: FailedRowError[];
  [key: string]: unknown;
};

export type EmployeeNotificationItem = {
  id: string | number;
  type?: string;
  title?: string;
  message?: string;
  data?: NotificationDataSummary | null;
  read_at?: string | null;
  readAt?: string | null;
  created_at?: string;
  createdAt?: string;
};

export async function getEmployeeNotifications(): Promise<EmployeeNotificationItem[]> {
  const response = await apiClient.get(ENDPOINTS.admissionEmployee.notifications);
  return extractArray<EmployeeNotificationItem>(response.data);
}

export async function markEmployeeNotificationAsRead(id: string | number): Promise<void> {
  await apiClient.patch(ENDPOINTS.admissionEmployee.readNotification(id));
}

export async function markAllEmployeeNotificationsAsRead(): Promise<void> {
  await apiClient.patch(ENDPOINTS.admissionEmployee.readAllNotifications);
}

export async function deleteEmployeeNotification(id: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.admissionEmployee.deleteNotification(id));
}

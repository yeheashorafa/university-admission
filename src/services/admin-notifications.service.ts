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

export type AdminNotificationItem = {
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

export async function getAdminNotifications(): Promise<AdminNotificationItem[]> {
  const response = await apiClient.get(ENDPOINTS.admin.notifications);
  return extractArray<AdminNotificationItem>(response.data);
}

export async function markAdminNotificationAsRead(id: string | number): Promise<void> {
  await apiClient.patch(ENDPOINTS.admin.readNotification(id));
}

export async function markAllAdminNotificationsAsRead(): Promise<void> {
  await apiClient.patch(ENDPOINTS.admin.readAllNotifications);
}

export async function deleteAdminNotification(id: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.admin.deleteNotification(id));
}

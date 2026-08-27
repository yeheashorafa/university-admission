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

export type HeadNotificationItem = {
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

export async function getHeadNotifications(): Promise<HeadNotificationItem[]> {
  const response = await apiClient.get(ENDPOINTS.departmentHead.notifications);
  return extractArray<HeadNotificationItem>(response.data);
}

export async function markHeadNotificationAsRead(id: string | number): Promise<void> {
  await apiClient.patch(ENDPOINTS.departmentHead.readNotification(id));
}

export async function markAllHeadNotificationsAsRead(): Promise<void> {
  await apiClient.patch(ENDPOINTS.departmentHead.readAllNotifications);
}

export async function deleteHeadNotification(id: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.departmentHead.deleteNotification(id));
}

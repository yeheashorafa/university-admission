import { apiClient, extractArray } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type NotificationType =
  | "document"
  | "status"
  | "payment"
  | "admission"
  | "general";

export type NotificationItem = {
  id: string | number;
  title?: string;
  message: string;
  type?: NotificationType;
  data?: Record<string, unknown>;
  readAt?: string | null;
  read_at?: string | null;
  createdAt?: string;
  created_at?: string;
};

export function getNotificationTitle(item: NotificationItem, isAr: boolean = true): string {
  if (item.title && item.title.trim()) return item.title;
  switch (item.type) {
    case "document":
      return isAr ? "تنبيه مستندات" : "Document Alert";
    case "status":
      return isAr ? "تحديث حالة الطلب" : "Status Update";
    case "payment":
      return isAr ? "تنبيه مدفوعات" : "Payment Alert";
    case "admission":
      return isAr ? "إشعار قبول" : "Admission Alert";
    default:
      return isAr ? "إشعار عام" : "Notification";
  }
}

export async function getMyNotifications(params?: {
  page?: number;
  type?: NotificationType;
  status?: "read" | "unread";
}): Promise<NotificationItem[]> {
  const response = await apiClient.get(ENDPOINTS.student.notifications, { params });
  return extractArray<NotificationItem>(response.data);
}

export async function markNotificationAsRead(
  notificationId: string | number
): Promise<void> {
  await apiClient.patch(`/student/notifications/${notificationId}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.patch("/student/notifications/read-all");
}

export async function deleteNotification(
  notificationId: string | number
): Promise<void> {
  await apiClient.delete(`/student/notifications/${notificationId}`);
}

export async function getStaffNotifications(
  role: "admission_employee" | "department_head",
  params?: { page?: number }
): Promise<NotificationItem[]> {
  const endpoint =
    role === "admission_employee"
      ? ENDPOINTS.admissionEmployee.notifications
      : ENDPOINTS.departmentHead.notifications;
  const response = await apiClient.get(endpoint, { params });
  return extractArray<NotificationItem>(response.data);
}

export async function markStaffNotificationAsRead(
  role: "admission_employee" | "department_head",
  notificationId: string | number
): Promise<void> {
  const endpoint =
    role === "admission_employee"
      ? ENDPOINTS.admissionEmployee.readNotification(notificationId)
      : ENDPOINTS.departmentHead.readNotification(notificationId);
  await apiClient.patch(endpoint);
}

export async function markAllStaffNotificationsAsRead(
  role: "admission_employee" | "department_head"
): Promise<void> {
  const endpoint =
    role === "admission_employee"
      ? ENDPOINTS.admissionEmployee.readAllNotifications
      : ENDPOINTS.departmentHead.readAllNotifications;
  await apiClient.patch(endpoint);
}

export async function deleteStaffNotification(
  role: "admission_employee" | "department_head",
  notificationId: string | number
): Promise<void> {
  const endpoint =
    role === "admission_employee"
      ? ENDPOINTS.admissionEmployee.deleteNotification(notificationId)
      : ENDPOINTS.departmentHead.deleteNotification(notificationId);
  await apiClient.delete(endpoint);
}
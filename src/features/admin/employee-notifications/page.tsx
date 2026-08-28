"use client";

import { useMemo } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import {
  useEmployeeNotificationsQuery,
  useMarkEmployeeNotificationAsReadMutation,
  useDeleteEmployeeNotificationMutation,
} from "@/hooks/queries/use-employee-notifications-queries";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { getNotificationTitle, type NotificationItem } from "@/services/notifications.service";
import type { NotificationDataSummary } from "@/services/employee-notifications.service";
import { AdminNotificationsHeader } from "@/features/admin/notifications/components/admin-notifications-header";
import { NotificationStats } from "@/features/admin/notifications/components/notification-stats";
import { NotificationsList } from "@/features/admin/notifications/components/notifications-list";
import type { AdminNotification, NotificationType } from "@/features/admin/notifications/data/admin-notifications.data";

export function EmployeeNotificationsPage() {
  const t = useTranslations("admin");

  const query = useEmployeeNotificationsQuery();

  const markRead = useMarkEmployeeNotificationAsReadMutation();
  const deleteNotif = useDeleteEmployeeNotificationMutation();

  const isLoading = query.isLoading;

  const notifications = useMemo<AdminNotification[]>(() => {
    const list = Array.isArray(query.data) ? query.data : [];
    return list.map((n) => ({
      id: String(n.id),
      title: getNotificationTitle(n as NotificationItem, true),
      message: n.message || "",
      type: (n.type as NotificationType) || "general",
      audience: "إشعارات النظام",
      status: n.readAt || n.read_at ? "sent" : "scheduled",
      sentAt: n.createdAt || n.created_at || "اليوم",
      data: ((n as Record<string, unknown>).data as NotificationDataSummary) || null,
      readAt: n.readAt || n.read_at || null,
    }));
  }, [query.data]);

  async function handleChangeStatus(notificationId: string) {
    try {
      await markRead.mutateAsync(notificationId);
      await Swal.fire({
        title: t("notifications.successTitle"),
        text: "تم تحديث حالة الإشعار",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        title: "خطأ",
        text: getApiErrorMessage(err),
        icon: "error",
      });
    }
  }

  async function handleDeleteNotification(notificationId: string) {
    const result = await Swal.fire({
      title: t("notifications.deleteConfirmTitle"),
      text: t("notifications.deleteConfirmDescription"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("notifications.delete"),
      cancelButtonText: t("notifications.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteNotif.mutateAsync(notificationId);
      await Swal.fire({
        title: t("notifications.successTitle"),
        text: t("notifications.deletedSuccessfully"),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      await Swal.fire({
        title: "خطأ",
        text: getApiErrorMessage(err),
        icon: "error",
      });
    }
  }

  return (
    <AdminLayout activePath={routes.adminEmployeeNotifications}>
      <div className="flex flex-col gap-8">
        <AdminNotificationsHeader />

        <NotificationStats notifications={notifications} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-12">
            {isLoading ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground font-semibold">
                جاري تحميل الإشعارات من الخادم...
              </div>
            ) : (
              <NotificationsList
                notifications={notifications}
                onChangeStatus={handleChangeStatus}
                onDeleteNotification={handleDeleteNotification}
              />
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

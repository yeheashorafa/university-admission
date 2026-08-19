"use client";

import { useMemo } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  useAdminNotificationsQuery,
  useMarkAdminNotificationAsReadMutation,
  useDeleteAdminNotificationMutation,
} from "@/hooks/queries/use-admin-notifications-queries";
import {
  useStaffNotificationsQuery,
  useMarkStaffNotificationAsReadMutation,
  useDeleteStaffNotificationMutation,
} from "@/hooks/queries/use-notifications-queries";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { getNotificationTitle } from "@/services/notifications.service";
import type { NotificationDataSummary } from "@/services/admin-notifications.service";
import { AdminNotificationsHeader } from "./components/admin-notifications-header";
import { NotificationStats } from "./components/notification-stats";
import { NotificationComposer } from "./components/notification-composer";
import { NotificationsList } from "./components/notifications-list";
import type { AdminNotification, NotificationType } from "./data/admin-notifications.data";

export function AdminNotificationsPage() {
  const t = useTranslations("admin");
  const { user } = useCurrentAuth();

  const isAdmin = user?.role === "admin";

  const adminQuery = useAdminNotificationsQuery();
  const staffQuery = useStaffNotificationsQuery();

  const markAdminRead = useMarkAdminNotificationAsReadMutation();
  const markStaffRead = useMarkStaffNotificationAsReadMutation();

  const deleteAdminNotif = useDeleteAdminNotificationMutation();
  const deleteStaffNotif = useDeleteStaffNotificationMutation();

  const isLoading = isAdmin ? adminQuery.isLoading : staffQuery.isLoading;

  const notifications = useMemo<AdminNotification[]>(() => {
    if (isAdmin) {
      const list = Array.isArray(adminQuery.data) ? adminQuery.data : [];
      return list.map((n) => ({
        id: String(n.id),
        title: n.title || (n.type === "secondary_school_record_import" ? t("tawjihiImportTitle") : "إشعار أدمن"),
        message: n.message || "",
        type: (n.type as NotificationType) || "general",
        audience: "النظام الإداري",
        status: n.read_at || n.readAt ? "sent" : "scheduled",
        sentAt: n.created_at || n.createdAt || "اليوم",
        data: n.data || null,
        readAt: n.read_at || n.readAt || null,
      }));
    } else {
      const list = Array.isArray(staffQuery.data) ? staffQuery.data : [];
      return list.map((n) => ({
        id: String(n.id),
        title: getNotificationTitle(n, true),
        message: n.message,
        type: (n.type as NotificationType) || "general",
        audience: "إشعارات النظام",
        status: n.readAt || n.read_at ? "sent" : "scheduled",
        sentAt: n.createdAt || n.created_at || "اليوم",
        data: ((n as Record<string, unknown>).data as NotificationDataSummary) || null,
      }));
    }
  }, [isAdmin, adminQuery.data, staffQuery.data, t]);

  async function handleChangeStatus(notificationId: string) {
    try {
      if (isAdmin) {
        await markAdminRead.mutateAsync(notificationId);
      } else {
        await markStaffRead.mutateAsync(notificationId);
      }
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
      if (isAdmin) {
        await deleteAdminNotif.mutateAsync(notificationId);
      } else {
        await deleteStaffNotif.mutateAsync(notificationId);
      }
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
    <AdminLayout activePath={routes.adminNotifications}>
      <div className="flex flex-col gap-8">
        <AdminNotificationsHeader />

        <NotificationStats notifications={notifications} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-5">
            <NotificationComposer />
          </section>

          <section className="xl:col-span-7">
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
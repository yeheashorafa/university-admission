"use client";

import { useMemo } from "react";
import Swal from "sweetalert2";
import { useTranslations } from "next-intl";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import {
  useStaffNotificationsQuery,
  useMarkStaffNotificationAsReadMutation,
  useDeleteStaffNotificationMutation,
} from "@/hooks/queries/use-notifications-queries";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { getNotificationTitle } from "@/services/notifications.service";
import { AdminNotificationsHeader } from "./components/admin-notifications-header";
import { NotificationStats } from "./components/notification-stats";
import { NotificationComposer } from "./components/notification-composer";
import { NotificationsList } from "./components/notifications-list";
import type { AdminNotification } from "./data/admin-notifications.data";

export function AdminNotificationsPage() {
  const t = useTranslations("admin");
  const { user } = useCurrentAuth();

  const isStaff = user?.role === "admission_employee" || user?.role === "department_head";

  const { data: staffNotifs, isLoading } = useStaffNotificationsQuery();
  const markReadMutation = useMarkStaffNotificationAsReadMutation();
  const deleteMutation = useDeleteStaffNotificationMutation();

  const notifications = useMemo<AdminNotification[]>(() => {
    const list = Array.isArray(staffNotifs) ? staffNotifs : [];
    return list.map((n) => ({
      id: String(n.id),
      title: getNotificationTitle(n, true),
      message: n.message,
      type: (n.type as "document" | "status" | "payment" | "admission" | "general") || "general",
      audience: "إشعارات النظام",
      status: n.readAt || n.read_at ? "sent" : "scheduled",
      sentAt: n.createdAt || n.created_at || "اليوم",
    }));
  }, [staffNotifs]);



  async function handleChangeStatus(notificationId: string) {
    try {
      await markReadMutation.mutateAsync(notificationId);
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
      await deleteMutation.mutateAsync(notificationId);
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

        {!isStaff && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-800 dark:text-amber-300">
            <span>PENDING_BACKEND_API:</span>
            <span>إشعارات الكادر متوفرة لأدوار موظف القبول ورئيس القسم فقط (GET /api/v1/admission_employee/notifications & GET /api/v1/department_head/notifications).</span>
          </div>
        )}

        <NotificationStats notifications={notifications} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-5">
            <NotificationComposer />
          </section>

          <section className="xl:col-span-7">
            {isLoading ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
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
"use client";

import { useLocale, useTranslations } from "next-intl";
import { BellOff } from "lucide-react";
import { ListSkeleton } from "@/components/common/loading/list-skeleton";
import { useSearchParams } from "next/navigation";
import { getNotificationTitle } from "@/services/notifications.service";
import { useMyNotificationsQuery } from "@/hooks/queries/use-notifications-queries";
import { NotificationCard } from "./notification-card";

export function NotificationsList() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const isAr = locale === "ar";

  const searchParams = useSearchParams();
  const search = searchParams?.get("q")?.toLowerCase() || "";
  const typeFilter = searchParams?.get("type") || "all";
  const statusFilter = searchParams?.get("status") || "all";

  // Pass type/status to backend query when available; local filtering still applied as fallback.
  const { data: notifications, isLoading, isError } = useMyNotificationsQuery({
    type: typeFilter !== "all" ? (typeFilter as import("@/services/notifications.service").NotificationType) : undefined,
    status: statusFilter === "read" || statusFilter === "unread" ? statusFilter : undefined,
  });
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const filteredNotifications = safeNotifications.filter((notification) => {
    if (typeFilter !== "all" && notification.type !== typeFilter) return false;
    
    const isRead = Boolean(notification.readAt || notification.read_at);
    if (statusFilter === "read" && !isRead) return false;
    if (statusFilter === "unread" && isRead) return false;
    
    if (search) {
      const title = getNotificationTitle(notification, isAr).toLowerCase();
      const message = notification.message.toLowerCase();
      if (!title.includes(search) && !message.includes(search)) return false;
    }
    
    return true;
  });

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border bg-muted px-6 py-5">
        <h2 className="text-xl font-bold text-primary">
          {t("recentNotifications")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("recentNotificationsDescription")}
        </p>
      </div>

      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="p-4">
            <ListSkeleton items={4} />
          </div>
        ) : isError || filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground space-y-3">
            <BellOff className="size-8 mx-auto text-muted-foreground/50" />
            <p>{isAr ? "لا توجد الإشعارات حالياً." : "No notifications found."}</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={{
                id: notification.id,
                title: getNotificationTitle(notification, isAr),
                message: notification.message,
                type: notification.type || "general",
                status: notification.readAt || notification.read_at ? "read" : "unread",
                createdAt: notification.createdAt || notification.created_at || new Date().toISOString(),
              }}
            />
          ))
        )}
      </div>
    </section>
  );
}
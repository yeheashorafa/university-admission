"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import type {
  AdminNotification,
  AdminNotificationStatus,
} from "../data/admin-notifications.data";
import { NotificationListItem } from "./notification-list-item";

type NotificationsListProps = {
  notifications: AdminNotification[];
  onChangeStatus: (
    notificationId: string,
    status: AdminNotificationStatus
  ) => void;
  onDeleteNotification: (notificationId: string) => void;
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "");
}

export function NotificationsList({
  notifications,
  onChangeStatus,
  onDeleteNotification,
}: NotificationsListProps) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");

  const filteredNotifications = useMemo(() => {
    const value = normalizeSearchText(search);

    if (!value) return notifications;

    return notifications.filter((notification) => {
      const searchableText = normalizeSearchText(
        [
          notification.title,
          notification.message,
          notification.audience,
          notification.status,
          notification.type,
          notification.sentAt,
        ].join(" ")
      );

      return searchableText.includes(value);
    });
  }, [notifications, search]);

  return (
    <section className="rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {t("notifications.historyTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("notifications.historyDescription")}
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("notifications.searchPlaceholder")}
              className="h-11 w-full rounded-lg border border-input bg-card px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {filteredNotifications.map((notification) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
            onSend={() => onChangeStatus(notification.id, "sent")}
            onDelete={() => onDeleteNotification(notification.id)}
          />
        ))}

        {filteredNotifications.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {t("notifications.noNotificationsFound")}
          </div>
        )}
      </div>
    </section>
  );
}
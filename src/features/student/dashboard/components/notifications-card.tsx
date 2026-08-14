"use client";

import { useLocale, useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import Link from "next/link";
import { routes, withLocale } from "@/constants/routes";
import { useMyNotificationsQuery } from "@/hooks/queries/use-notifications-queries";

export function NotificationsCard() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: notifications } = useMyNotificationsQuery();
  const list = notifications?.slice(0, 3) || [];
  const unreadCount = notifications?.filter((n) => !n.readAt && !n.read_at).length || 0;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
          <Bell className="size-6 text-secondary" />
          {t("notifications")}
        </h2>

        {unreadCount > 0 && (
          <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </div>

      {list.length === 0 ? (
        <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
          {isAr ? "لا توجد إشعارات حالية" : "No recent notifications"}
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((notification) => (
            <li
              className="cursor-pointer rounded-lg border-s-4 border-s-primary bg-muted p-4 transition hover:bg-muted/70"
              key={notification.id}
            >
              <Link href={withLocale(locale, routes.notifications)}>
                <p className="text-sm font-medium leading-6 text-foreground">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {notification.message}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

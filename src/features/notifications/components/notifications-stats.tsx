"use client";

import { useLocale } from "next-intl";
import { Bell, FileWarning, GraduationCap, MailOpen } from "lucide-react";
import { useMyNotificationsQuery } from "@/hooks/queries/use-notifications-queries";

export function NotificationsStats() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: notifications } = useMyNotificationsQuery();

  const total = notifications?.length ?? 0;
  const unread = notifications?.filter((n) => !n.read_at && !n.readAt).length ?? 0;
  const documentCount = notifications?.filter((n) => n.type === "document").length ?? 0;
  const statusCount = notifications?.filter((n) => n.type === "admission" || n.type === "status").length ?? 0;

  const stats = [
    { key: "total", label: isAr ? "إجمالي الإشعارات" : "Total Notifications", value: total, icon: Bell },
    { key: "unread", label: isAr ? "غير مقروءة" : "Unread Notifications", value: unread, icon: MailOpen },
    { key: "documents", label: isAr ? "إشعارات المستندات" : "Document Alerts", value: documentCount, icon: FileWarning },
    { key: "status", label: isAr ? "تحديثات الحالة" : "Status Updates", value: statusCount, icon: GraduationCap },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.key}
            className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]"
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-6" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>

            <p className="mt-1 text-3xl font-bold text-primary">
              {stat.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
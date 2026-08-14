"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Clock3, FileText, Send, Users } from "lucide-react";
import type { AdminNotification } from "../data/admin-notifications.data";

const icons = [Send, Clock3, FileText, Users];

type NotificationStatsProps = {
  notifications: AdminNotification[];
};

export function NotificationStats({ notifications }: NotificationStatsProps) {
  const t = useTranslations("admin");

  const stats = useMemo(() => {
    const sentToday = notifications.filter(
      (notification) => notification.status === "sent"
    ).length;

    const scheduled = notifications.filter(
      (notification) => notification.status === "scheduled"
    ).length;

    const drafts = notifications.filter(
      (notification) => notification.status === "draft"
    ).length;

    const recipientsReached = notifications.length * 24;

    return [
      {
        key: "sentToday",
        value: sentToday.toLocaleString(),
      },
      {
        key: "scheduled",
        value: scheduled.toLocaleString(),
      },
      {
        key: "drafts",
        value: drafts.toLocaleString(),
      },
      {
        key: "recipientsReached",
        value: recipientsReached.toLocaleString(),
      },
    ];
  }, [notifications]);

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index];

        return (
          <article
            key={stat.key}
            className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]"
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-6" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {t(`notifications.stats.${stat.key}`)}
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
"use client";

import { useTranslations } from "next-intl";
import {
  Bell,
  CalendarClock,
  CircleDollarSign,
  FileWarning,
  Send,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AdminNotification,
  AdminNotificationStatus,
  NotificationType,
} from "../data/admin-notifications.data";

type NotificationListItemProps = {
  notification: AdminNotification;
  onSend: () => void;
  onDelete: () => void;
};

const typeConfig: Record<
  NotificationType,
  {
    labelKey: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  document: {
    labelKey: "notifications.types.document",
    icon: FileWarning,
    className: "bg-destructive/10 text-destructive",
  },
  status: {
    labelKey: "notifications.types.status",
    icon: Bell,
    className: "bg-secondary/10 text-secondary",
  },
  payment: {
    labelKey: "notifications.types.payment",
    icon: CircleDollarSign,
    className: "bg-accent/40 text-accent-foreground",
  },
  admission: {
    labelKey: "notifications.types.status",
    icon: Bell,
    className: "bg-primary/10 text-primary",
  },
  general: {
    labelKey: "notifications.types.general",
    icon: Send,
    className: "bg-primary/10 text-primary",
  },
};

const statusConfig: Record<
  AdminNotificationStatus,
  {
    labelKey: string;
    className: string;
  }
> = {
  sent: {
    labelKey: "notifications.statuses.sent",
    className: "bg-primary/10 text-primary",
  },
  scheduled: {
    labelKey: "notifications.statuses.scheduled",
    className: "bg-secondary/10 text-secondary",
  },
  draft: {
    labelKey: "notifications.statuses.draft",
    className: "bg-muted text-muted-foreground",
  },
};

export function NotificationListItem({
  notification,
  onSend,
  onDelete,
}: NotificationListItemProps) {
  const t = useTranslations("admin");

  const type = typeConfig[notification.type];
  const status = statusConfig[notification.status];
  const TypeIcon = type.icon;

  return (
    <article className="p-6 transition hover:bg-muted/60">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg",
              type.className
            )}
          >
            <TypeIcon className="size-5" />
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-foreground">
                {notification.title}
              </h3>

              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  status.className
                )}
              >
                {t(status.labelKey)}
              </span>
            </div>

            <p className="leading-7 text-muted-foreground">
              {notification.message}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>
                {t("notifications.audienceLabel")}: {notification.audience}
              </span>

              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-4" />
                {notification.sentAt}
              </span>

              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  type.className
                )}
              >
                {t(type.labelKey)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-max items-center gap-1">
          {notification.status !== "sent" && (
            <button
              type="button"
              onClick={onSend}
              title={t("notifications.sendNow")}
              className="rounded-lg p-2 text-primary transition hover:bg-primary/10"
            >
              <Send className="size-5" />
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            title={t("notifications.delete")}
            className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
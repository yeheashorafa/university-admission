"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  CircleDollarSign,
  FileWarning,
  GraduationCap,
  Info,
  MailOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "document" | "status" | "payment" | "admission" | "general";

type NotificationCardProps = {
  notification: {
    id: string | number;
    title: string;
    message: string;
    type: NotificationType;
    status?: "read" | "unread";
    createdAt?: string;
  };
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
    labelKey: "typeDocument",
    icon: FileWarning,
    className: "bg-destructive/10 text-destructive",
  },
  status: {
    labelKey: "typeStatus",
    icon: Bell,
    className: "bg-secondary/10 text-secondary",
  },
  payment: {
    labelKey: "typePayment",
    icon: CircleDollarSign,
    className: "bg-accent/40 text-accent-foreground",
  },
  admission: {
    labelKey: "typeAdmission",
    icon: GraduationCap,
    className: "bg-primary/10 text-primary",
  },
  general: {
    labelKey: "typeGeneral",
    icon: Info,
    className: "bg-muted text-muted-foreground",
  },
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const isAr = locale === "ar";

  const type = typeConfig[notification.type] || typeConfig.general;
  const Icon = type.icon;
  const isUnread = notification.status === "unread";

  return (
    <article
      className={cn(
        "p-6 transition hover:bg-muted/60",
        isUnread && "bg-primary/5"
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              type.className
            )}
          >
            <Icon className="size-6" />
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">
                {notification.title}
              </h3>

              {isUnread && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {isAr ? "جديد" : "New"}
                </span>
              )}

              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  type.className
                )}
              >
                {t(type.labelKey)}
              </span>
            </div>

            <p className="max-w-3xl leading-7 text-muted-foreground">
              {notification.message}
            </p>

            {notification.createdAt && (
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <MailOpen className="size-4" />
                {notification.createdAt}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Bell,
  CalendarClock,
  CircleDollarSign,
  FileWarning,
  Send,
  Trash2,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
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
  secondary_school_record_import: {
    labelKey: "tawjihiImport",
    icon: FileSpreadsheet,
    className: "bg-emerald-500/10 text-emerald-600",
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
  const [showFailedRows, setShowFailedRows] = useState(false);

  const type = typeConfig[notification.type] || typeConfig.general;
  const status = statusConfig[notification.status] || statusConfig.sent;
  const TypeIcon = type.icon;

  const data = notification.data;
  const hasSummaryStats =
    data &&
    (data.total_rows !== undefined ||
      data.matched !== undefined ||
      data.pending !== undefined ||
      data.failed !== undefined);

  const failedRows = data?.failed_rows && Array.isArray(data.failed_rows) ? data.failed_rows : [];

  return (
    <article className="p-6 transition hover:bg-muted/60">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-lg",
              type.className
            )}
          >
            <TypeIcon className="size-5" />
          </div>

          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-foreground">{notification.title}</h3>

              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  status.className
                )}
              >
                {t(status.labelKey)}
              </span>
            </div>

            <p className="leading-7 text-muted-foreground">{notification.message}</p>

            {/* Notification Data Summary */}
            {hasSummaryStats && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 max-w-xl">
                <div className="rounded-xl border border-border bg-muted/30 p-2.5 text-center">
                  <span className="block text-[11px] font-bold text-muted-foreground">
                    {t("notifications.totalRows")}
                  </span>
                  <span className="text-base font-extrabold text-foreground">
                    {data.total_rows ?? 0}
                  </span>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center">
                  <span className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    {t("notifications.matched")}
                  </span>
                  <span className="text-base font-extrabold text-emerald-600">
                    {data.matched ?? 0}
                  </span>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center">
                  <span className="block text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    {t("notifications.pending")}
                  </span>
                  <span className="text-base font-extrabold text-amber-600">
                    {data.pending ?? 0}
                  </span>
                </div>
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-center">
                  <span className="block text-[11px] font-bold text-destructive">
                    {t("notifications.failed")}
                  </span>
                  <span className="text-base font-extrabold text-destructive">
                    {data.failed ?? 0}
                  </span>
                </div>
              </div>
            )}

            {/* Collapsible Failed Rows Details */}
            {failedRows.length > 0 && (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowFailedRows((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/10"
                >
                  <AlertTriangle className="size-4" />
                  <span>{t("notifications.failedRowsDetails")}</span>
                  {showFailedRows ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </button>

                {showFailedRows && (
                  <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                    <table className="w-full text-start text-xs">
                      <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 text-start">{t("notifications.rowIndex")}</th>
                          <th className="px-3 py-2 text-start">
                            {t("notifications.nationalIdColumn")}
                          </th>
                          <th className="px-3 py-2 text-start">
                            {t("notifications.errorDetailsColumn")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {failedRows.map((item, idx) => {
                          const errText = Array.isArray(item.errors)
                            ? item.errors.join(", ")
                            : typeof item.errors === "object" && item.errors !== null
                            ? Object.values(item.errors).flat().join(", ")
                            : String(item.errors || "-");

                          return (
                            <tr key={idx} className="hover:bg-muted/30">
                              <td className="px-3 py-2 font-mono font-bold">{item.row ?? idx + 1}</td>
                              <td className="px-3 py-2 font-mono">{item.national_id || "-"}</td>
                              <td className="px-3 py-2 font-medium text-destructive">{errText}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {notification.audience && (
                <span>
                  {t("notifications.audienceLabel")}: {notification.audience}
                </span>
              )}

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
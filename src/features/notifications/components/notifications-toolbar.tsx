"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCheck, Filter, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMarkAllNotificationsAsReadMutation } from "@/hooks/queries/use-notifications-queries";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function NotificationsToolbar() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const isAr = locale === "ar";

  const markAllMutation = useMarkAllNotificationsAsReadMutation();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams?.get("q") || "");
  const [type, setType] = useState(searchParams?.get("type") || "all");
  const [status, setStatus] = useState(searchParams?.get("status") || "all");

  async function handleMarkAllRead() {
    try {
      await markAllMutation.mutateAsync();
      toast.success(isAr ? "تم تحديد جميع الإشعارات كمقروءة" : "All notifications marked as read");
    } catch {
      toast.error(isAr ? "فشل العملية" : "Failed to mark notifications as read");
    }
  }

  function handleApply() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (type !== "all") params.set("type", type);
    if (status !== "all") params.set("status", status);

    router.push(`?${params.toString()}`);
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <h3 className="text-sm font-bold text-muted-foreground">
          {isAr ? "تصفية وتظليل الإشعارات" : "Filter & Search Notifications"}
        </h3>

        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markAllMutation.isPending}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 text-xs font-bold text-primary hover:bg-primary/10 transition disabled:opacity-50"
        >
          {markAllMutation.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCheck className="size-3.5" />
          )}
          {isAr ? "تحديد الكل كمقروء" : "Mark All as Read"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <label
            htmlFor="notification-search"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("searchNotifications")}
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="notification-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-lg border border-input bg-card px-4 ps-10 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <label
            htmlFor="notification-type"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("type")}
          </label>

          <select
            id="notification-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">{t("allTypes")}</option>
            <option value="document">{t("documents")}</option>
            <option value="status">{t("statusUpdates")}</option>
            <option value="payment">{t("payment")}</option>
            <option value="admission">{t("admission")}</option>
            <option value="general">{t("general")}</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <label
            htmlFor="notification-status"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("status")}
          </label>

          <select
            id="notification-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">{t("all")}</option>
            <option value="unread">{t("unread")}</option>
            <option value="read">{t("read")}</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-muted px-5 text-sm font-bold text-foreground transition hover:bg-muted/70 lg:col-span-1"
        >
          <Filter className="size-5" />
          {t("apply")}
        </button>
      </div>
    </section>
  );
}
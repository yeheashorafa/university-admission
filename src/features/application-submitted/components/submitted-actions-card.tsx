"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Download, FileText, LayoutDashboard } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import Swal from "sweetalert2";

export function SubmittedActionsCard() {
  const locale = useLocale();
  const t = useTranslations("applicationSubmitted");

  async function handleDownloadReceipt() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "تحميل إيصال الطلب غير متاح حالياً. سيكون متاحاً بعد ربط بيانات الطلب من الخادم.",
      icon: "info",
    });
  }

  return (
    <section className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <h2 className="mb-5 text-xl font-bold text-primary">
        {t("actions.title")}
      </h2>

      <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-xs font-mono text-amber-700 dark:text-amber-300">
          PENDING_BACKEND_API — رقم الطلب غير متاح
        </p>
        <p className="mt-1 text-xl font-bold text-muted-foreground">—</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          href={withLocale(locale, routes.status)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <FileText className="size-5" />
          {t("actions.trackStatus")}
        </Link>

        <Link
          href={withLocale(locale, routes.notifications)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-secondary text-sm font-bold text-secondary transition hover:bg-secondary/10"
        >
          <Bell className="size-5" />
          {t("actions.viewNotifications")}
        </Link>

        <Link
          href={withLocale(locale, routes.dashboard)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold text-foreground transition hover:bg-muted"
        >
          <LayoutDashboard className="size-5" />
          {t("actions.goToDashboard")}
        </Link>

        <button
          type="button"
          onClick={handleDownloadReceipt}
          className="inline-flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold text-muted-foreground opacity-60 transition"
        >
          <Download className="size-5" />
          {t("actions.downloadReceipt")}
        </button>
      </div>
    </section>
  );
}
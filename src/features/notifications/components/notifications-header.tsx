"use client";

import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";

export function NotificationsHeader() {
  const t = useTranslations("notifications");

  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] md:p-8">
      <div className="pointer-events-none absolute -end-20 -top-20 size-56 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            {t("subtitle")}
          </p>

          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bell className="size-9" />
        </div>
      </div>
    </section>
  );
}
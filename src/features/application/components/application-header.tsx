"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, X } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";

export function ApplicationHeader() {
  const locale = useLocale();
  const t = useTranslations("application");

  return (
    <header className="border-b border-border bg-card">
      <div className="app-container flex h-20 items-center justify-between">
        <Link
          href={withLocale(locale, routes.dashboard)}
          className="text-xl font-bold text-primary"
        >
          {t("universityName")}
        </Link>

        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-2 text-sm font-medium text-muted-foreground sm:flex">
            <CheckCircle2 className="size-5 text-primary" />
            {t("savedJustNow")}
          </span>

          <Link
            href={withLocale(locale, routes.dashboard)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={t("closeApplication")}
          >
            <X className="size-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}
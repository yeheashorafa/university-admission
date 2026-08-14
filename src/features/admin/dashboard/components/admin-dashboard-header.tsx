"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

export function AdminDashboardHeader() {
  const t = useTranslations("admin");

  return (
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {t("dashboardTitle")}
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("admissionOverview")}
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          {t("admissionOverviewDescription")}
        </p>
      </div>

      <button
        type="button"
        className="inline-flex h-12 w-max items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        <Download className="size-5" />
        {t("exportReport")}
      </button>
    </header>
  );
}
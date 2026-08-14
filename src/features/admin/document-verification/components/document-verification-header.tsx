"use client";

import { useTranslations } from "next-intl";
import { Bot } from "lucide-react";

export function DocumentVerificationHeader() {
  const t = useTranslations("admin");

  return (
    <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {t("documentVerification.subtitle")}
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("documentVerification.title")}
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {t("documentVerification.description")}
        </p>
      </div>

      <div className="flex w-max items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
        <Bot className="size-5 text-accent-foreground" />
        {t("documentVerification.aiNote")}
      </div>
    </header>
  );
}
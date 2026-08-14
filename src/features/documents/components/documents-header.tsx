"use client";

import { useTranslations } from "next-intl";

export function DocumentsHeader() {
  const t = useTranslations("documents");

  return (
    <header>
      <p className="mb-2 text-sm font-medium text-muted-foreground">
        {t("subtitle")}
      </p>

      <h1 className="text-3xl font-bold text-primary md:text-4xl">
        {t("headerTitle")}
      </h1>

      <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
        {t("headerDescription")}
      </p>
    </header>
  );
}
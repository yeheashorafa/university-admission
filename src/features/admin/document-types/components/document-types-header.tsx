"use client";

import { useTranslations } from "next-intl";
import { Download, Plus } from "lucide-react";

type DocumentTypesHeaderProps = {
  onAddDocumentType: () => void;
};

export function DocumentTypesHeader({
  onAddDocumentType,
}: DocumentTypesHeaderProps) {
  const t = useTranslations("admin");

  return (
    <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {t("masterData.title")}
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("documentTypes.managementTitle")}
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {t("documentTypes.managementDescription")}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground transition hover:bg-muted"
        >
          <Download className="size-5" />
          {t("documentTypes.export")}
        </button>

        <button
          type="button"
          onClick={onAddDocumentType}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="size-5" />
          {t("documentTypes.add")}
        </button>
      </div>
    </header>
  );
}

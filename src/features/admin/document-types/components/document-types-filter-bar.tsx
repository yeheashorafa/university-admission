"use client";

import { useTranslations } from "next-intl";
import { RotateCcw, Search } from "lucide-react";

type DocumentTypesFilterBarProps = {
  search: string;
  required: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
};

export function DocumentTypesFilterBar({
  search,
  required,
  onSearchChange,
  onFilterChange,
  onReset,
}: DocumentTypesFilterBarProps) {
  const t = useTranslations("admin");

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <label
            htmlFor="document-type-search"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("documentTypes.search")}
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="document-type-search"
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("documentTypes.searchPlaceholder")}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 ps-10 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <label
            htmlFor="document-type-required"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("documentTypes.table.required")}
          </label>

          <select
            id="document-type-required"
            value={required || "all"}
            onChange={(event) => onFilterChange("required", event.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="all">{t("documentTypes.allStatuses")}</option>
            <option value="required">{t("documentTypes.yes")}</option>
            <option value="optional">{t("documentTypes.no")}</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-5 text-sm font-bold text-foreground transition hover:bg-muted/70 lg:col-span-1"
        >
          <RotateCcw className="size-5" />
          {t("documentTypes.reset")}
        </button>
      </div>
    </section>
  );
}

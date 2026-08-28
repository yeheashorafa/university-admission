"use client";

import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
};

export function AdminBranchesHeader({ searchQuery, onSearchChange, onAddClick }: Props) {
  const t = useTranslations("admin.branches");

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          {t("managementTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("managementDescription")}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-lg border border-border bg-background px-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:w-[250px]"
          />
        </div>

        <button
          onClick={onAddClick}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="size-4" />
          {t("add")}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

type AdminUsersHeaderProps = {
  onAddUser: () => void;
};

export function AdminUsersHeader({ onAddUser }: AdminUsersHeaderProps) {
  const t = useTranslations("admin");

  return (
    <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {t("users.accessControl")}
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("users.managementTitle")}
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {t("users.managementDescription")}
        </p>
      </div>

      <button
        type="button"
        onClick={onAddUser}
        className="inline-flex h-12 w-max items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        <Plus className="size-5" />
        {t("users.addNewUser")}
      </button>
    </header>
  );
}
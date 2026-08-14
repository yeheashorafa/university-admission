"use client";

import { useTranslations } from "next-intl";
import { RotateCcw, Search } from "lucide-react";
import { AdminCustomSelect } from "@/components/ui/admin-custom-select";

type UsersFilterBarProps = {
  search: string;
  role: string;

  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
};

export function UsersFilterBar({
  search,
  role,

  onSearchChange,
  onFilterChange,
  onReset,
}: UsersFilterBarProps) {
  const t = useTranslations("admin");

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <label
            htmlFor="user-search"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("users.searchUser")}
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="user-search"
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("users.searchPlaceholder")}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 ps-10 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <FilterSelect
          className="lg:col-span-3"
          id="role"
          label={t("users.role")}
          value={role || "all"}
          onChange={(value) => onFilterChange("role", value)}
          options={[
            {
              value: "all",
              label: t("users.allRoles"),
            },
            {
              value: "admin",
              label: "Admin",
            },
            {
              value: "admission_dean",
              label: "Admission Dean",
            },
            {
              value: "department_head",
              label: "Department Head",
            },
            {
              value: "admission_employee",
              label: "Admission Employee",
            },
            {
              value: "student",
              label: "Student",
            },
          ]}
        />

        <button
          type="button"
          onClick={onReset}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-5 text-sm font-bold text-foreground transition hover:bg-muted/70 lg:col-span-3"
        >
          <RotateCcw className="size-5" />
          {t("users.reset")}
        </button>
      </div>
    </section>
  );
}

type FilterSelectProps = {
  className?: string;
  id: string;
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
};

function FilterSelect({
  className,
  id,
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <div className={className || "lg:col-span-2"}>
      <AdminCustomSelect
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        options={options}
      />
    </div>
  );
}
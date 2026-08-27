"use client";

import { useLocale, useTranslations } from "next-intl";
import { RotateCcw, Search } from "lucide-react";
import { AdminCustomSelect } from "@/components/ui/admin-custom-select";
import { useAdminBranchesQuery } from "@/hooks/queries";

type AdminProgramsFilterBarProps = {
  search: string;
  faculty: string;
  status: string;
  branch: string;
  faculties: string[];
  onSearchChange: (value: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
};

export function AdminProgramsFilterBar({
  search,
  faculty,
  status,
  branch,
  faculties,
  onSearchChange,
  onFilterChange,
  onReset,
}: AdminProgramsFilterBarProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { data: branchList = [] } = useAdminBranchesQuery();

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-4">
          <label
            htmlFor="program-search"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("programs.searchProgram")}
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

            <input
              id="program-search"
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={t("programs.searchPlaceholder")}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 ps-10 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <FilterSelect
          id="faculty"
          value={faculty || "all"}
          label={t("programs.faculty")}
          onChange={(value) => onFilterChange("faculty", value)}
          options={[
            { value: "all", label: t("programs.allFaculties") },
            ...faculties.map((facultyItem) => ({
              value: facultyItem,
              label: facultyItem,
            })),
          ]}
          className="lg:col-span-3"
        />

        <FilterSelect
          id="status"
          value={status || "all"}
          label={t("programs.status")}
          onChange={(value) => onFilterChange("status", value)}
          options={[
            { value: "all", label: t("programs.allStatuses") },
            { value: "active", label: t("programs.statuses.active") },
            { value: "inactive", label: t("programs.statuses.inactive") },
            { value: "closed", label: t("programs.statuses.closed") },
          ]}
          className="lg:col-span-2"
        />

        <FilterSelect
          id="branch"
          value={branch || "all"}
          label={t("programs.branch")}
          onChange={(value) => onFilterChange("branch", value)}
          options={[
            { value: "all", label: t("programs.allBranches") },
            ...branchList.map((branch) => ({
              value: String(branch.id),
              label:
                locale === "ar"
                  ? branch.name_ar || branch.name_en || String(branch.id)
                  : branch.name_en || branch.name_ar || String(branch.id),
            })),
          ]}
          className="lg:col-span-2"
        />

        <button
          type="button"
          onClick={onReset}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-muted px-5 text-sm font-bold text-foreground transition hover:bg-muted/70 lg:col-span-1"
        >
          <RotateCcw className="size-5" />
          {t("programs.reset")}
        </button>
      </div>
    </section>
  );
}

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  className?: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
};

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  className,
}: FilterSelectProps) {
  return (
    <div className={className}>
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
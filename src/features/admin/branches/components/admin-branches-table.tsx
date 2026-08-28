"use client";

import { useTranslations } from "next-intl";
import { Edit2, Trash2 } from "lucide-react";
import type { AdminBranch } from "@/services/admin-branches.service";
import { cn } from "@/lib/utils";

type Props = {
  branches: AdminBranch[];
  isLoading: boolean;
  onEdit: (branch: AdminBranch) => void;
  onDelete: (branch: AdminBranch) => void;
};

export function AdminBranchesTable({ branches, isLoading, onEdit, onDelete }: Props) {
  const t = useTranslations("admin.branches");

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border bg-muted px-5 py-4">
        <h2 className="text-xl font-bold text-primary">
          {t("managementTitle")}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-start">
          <thead className="border-b border-border bg-card text-sm text-muted-foreground">
            <tr>
              <th className="px-5 py-4 text-start font-semibold">{t("nameAr")}</th>
              <th className="px-5 py-4 text-start font-semibold">{t("nameEn")}</th>
              <th className="px-5 py-4 text-start font-semibold">{t("status")}</th>
              <th className="px-5 py-4 text-start font-semibold w-[100px]"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-5 py-4"><div className="h-4 w-[150px] animate-pulse rounded bg-muted" /></td>
                  <td className="px-5 py-4"><div className="h-4 w-[150px] animate-pulse rounded bg-muted" /></td>
                  <td className="px-5 py-4"><div className="h-5 w-[80px] animate-pulse rounded-full bg-muted" /></td>
                  <td className="px-5 py-4"><div className="h-8 w-16 animate-pulse rounded bg-muted" /></td>
                </tr>
              ))
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                  {t("noResults")}
                </td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr key={branch.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-5 py-4 font-medium">{branch.name_ar}</td>
                  <td className="px-5 py-4">{branch.name_en}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        branch.is_active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {branch.is_active ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(branch)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary/10 hover:text-secondary"
                        title={t("edit")}
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        onClick={() => onDelete(branch)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        title={t("delete")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

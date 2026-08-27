"use client";

import { useTranslations } from "next-intl";
import { Edit, Power, PowerOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Department, DepartmentStatus } from "../data/departments.data";

type DepartmentsTableProps = {
  departments: Department[];
  totalDepartments: number;
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (departmentId: string | number) => void;
  onToggleStatus: (department: Department) => void;
};

const statusConfig: Record<
  DepartmentStatus,
  { labelKey: string; className: string }
> = {
  active: {
    labelKey: "departments.statuses.active",
    className: "bg-primary/10 text-primary",
  },
  inactive: {
    labelKey: "departments.statuses.inactive",
    className: "bg-muted text-muted-foreground",
  },
};

export function DepartmentsTable({
  departments,
  totalDepartments,
  currentPage,
  totalPages,
  from,
  to,
  onPageChange,
  onEditDepartment,
  onDeleteDepartment,
  onToggleStatus,
}: DepartmentsTableProps) {
  const t = useTranslations("admin");

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border bg-muted px-5 py-4">
        <h2 className="text-xl font-bold text-primary">
          {t("departments.managementTitle")}
        </h2>
      </div>

      {departments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-start">
            <thead className="border-b border-border bg-card text-sm text-muted-foreground">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("departments.table.faculty")}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("departments.table.nameEn")}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("departments.table.nameAr")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("departments.table.status")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("departments.table.actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {departments.map((department) => {
                const status: DepartmentStatus = department.is_active
                  ? "active"
                  : "inactive";
                const config = statusConfig[status];

                return (
                  <tr
                    key={department.id}
                    className="group transition hover:bg-muted/60"
                  >
                    <td className="px-5 py-4">
                      <p className="text-foreground">
                        {department.facultyName ?? "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground">
                        {department.name_en}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-foreground">{department.name_ar}</p>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                          config.className
                        )}
                      >
                        {t(config.labelKey)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onEditDepartment(department)}
                          title={t("departments.edit")}
                          className="rounded-lg p-2 text-primary transition hover:bg-primary/10"
                        >
                          <Edit className="size-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStatus(department)}
                          title={
                            status === "active"
                              ? t("departments.disable")
                              : t("departments.enable")
                          }
                          className={cn(
                            "rounded-lg p-2 transition",
                            status === "active"
                              ? "text-destructive hover:bg-destructive/10"
                              : "text-primary hover:bg-primary/10"
                          )}
                        >
                          {status === "active" ? (
                            <PowerOff className="size-5" />
                          ) : (
                            <Power className="size-5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteDepartment(department.id)}
                          title={t("departments.delete")}
                          className="rounded-lg p-2 text-destructive transition hover:bg-destructive/10"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center">
          <h2 className="text-xl font-bold text-primary">
            {t("departments.noResultsTitle")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("departments.noResultsDescription")}
          </p>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 border-t border-border bg-muted px-5 py-4 sm:flex-row sm:items-center">
        <span className="text-sm text-muted-foreground">
          {t("departments.paginationInfo", {
            from,
            to,
            total: totalDepartments,
          })}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("departments.previous")}
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-card",
                    page === currentPage &&
                      "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("departments.next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

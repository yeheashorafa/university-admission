"use client";

import { useTranslations } from "next-intl";
import { Edit, Power, PowerOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Faculty, FacultyStatus } from "../data/faculties.data";

type FacultiesTableProps = {
  faculties: Faculty[];
  totalFaculties: number;
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onEditFaculty: (faculty: Faculty) => void;
  onDeleteFaculty: (facultyId: string | number) => void;
  onToggleStatus: (faculty: Faculty) => void;
};

const statusConfig: Record<
  FacultyStatus,
  { labelKey: string; className: string }
> = {
  active: { labelKey: "faculties.statuses.active", className: "bg-primary/10 text-primary" },
  inactive: {
    labelKey: "faculties.statuses.inactive",
    className: "bg-muted text-muted-foreground",
  },
};

export function FacultiesTable({
  faculties,
  totalFaculties,
  currentPage,
  totalPages,
  from,
  to,
  onPageChange,
  onEditFaculty,
  onDeleteFaculty,
  onToggleStatus,
}: FacultiesTableProps) {
  const t = useTranslations("admin");

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border bg-muted px-5 py-4">
        <h2 className="text-xl font-bold text-primary">
          {t("faculties.managementTitle")}
        </h2>
      </div>

      {faculties.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-start">
            <thead className="border-b border-border bg-card text-sm text-muted-foreground">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("faculties.table.nameEn")}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("faculties.table.nameAr")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("faculties.table.status")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("faculties.table.actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {faculties.map((faculty) => {
                const status: FacultyStatus = faculty.is_active
                  ? "active"
                  : "inactive";
                const config = statusConfig[status];

                return (
                  <tr key={faculty.id} className="group transition hover:bg-muted/60">
                    <td className="px-5 py-4">
                      <p className="font-bold text-foreground">
                        {faculty.name_en}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-foreground">{faculty.name_ar}</p>
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
                          onClick={() => onEditFaculty(faculty)}
                          title={t("faculties.edit")}
                          className="rounded-lg p-2 text-primary transition hover:bg-primary/10"
                        >
                          <Edit className="size-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStatus(faculty)}
                          title={
                            status === "active"
                              ? t("faculties.disable")
                              : t("faculties.enable")
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
                          onClick={() => onDeleteFaculty(faculty.id)}
                          title={t("faculties.delete")}
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
            {t("faculties.noResultsTitle")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("faculties.noResultsDescription")}
          </p>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 border-t border-border bg-muted px-5 py-4 sm:flex-row sm:items-center">
        <span className="text-sm text-muted-foreground">
          {t("faculties.paginationInfo", {
            from,
            to,
            total: totalFaculties,
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
              {t("faculties.previous")}
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
              {t("faculties.next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

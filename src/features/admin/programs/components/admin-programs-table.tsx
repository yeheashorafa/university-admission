"use client";

import { useTranslations } from "next-intl";
import type { AdminProgram } from "../data/admin-programs.data";
import { AdminProgramsTableRow } from "./admin-programs-table-row";
import { cn } from "@/lib/utils";

type AdminProgramsTableProps = {
  programs: AdminProgram[];
  totalPrograms: number;
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onEditProgram: (program: AdminProgram) => void;
  onDeleteProgram: (programId: string) => void;
  onToggleStatus: (program: AdminProgram) => void;
};

export function AdminProgramsTable({
  programs,
  totalPrograms,
  currentPage,
  totalPages,
  from,
  to,
  onPageChange,
  onEditProgram,
  onDeleteProgram,
  onToggleStatus,
}: AdminProgramsTableProps) {
  const t = useTranslations("admin");

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border bg-muted px-5 py-4">
        <h2 className="text-xl font-bold text-primary">
          {t("programs.academicPrograms")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("programs.academicProgramsDescription")}
        </p>
      </div>

      {programs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-start">
            <thead className="border-b border-border bg-card text-sm text-muted-foreground">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("programs.table.program")}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("programs.table.branches")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("programs.table.minimumRate")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("programs.table.capacity")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("programs.table.applications")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("programs.table.accepted")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("programs.table.status")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("programs.table.actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {programs.map((program) => (
                <AdminProgramsTableRow
                  key={program.id}
                  program={program}
                  onEdit={() => onEditProgram(program)}
                  onDelete={() => onDeleteProgram(program.id)}
                  onToggleStatus={() => onToggleStatus(program)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center">
          <h2 className="text-xl font-bold text-primary">
            {t("programs.noResultsTitle")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("programs.noResultsDescription")}
          </p>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 border-t border-border bg-muted px-5 py-4 sm:flex-row sm:items-center">
        <span className="text-sm text-muted-foreground">
          {t("programs.paginationInfo", {
            from,
            to,
            total: totalPrograms,
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
              {t("programs.previous")}
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
              {t("programs.next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
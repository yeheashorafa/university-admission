"use client";

import { useTranslations } from "next-intl";
import type { AuthUser } from "@/services/auth.service";
import { UsersTableRow } from "./users-table-row";
import { cn } from "@/lib/utils";

type UsersTableProps = {
  users: AuthUser[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onEditUser: (user: AuthUser) => void;
  onDeleteUser: (userId: string | number) => Promise<void>;
};

export function UsersTable({
  users,
  totalUsers,
  currentPage,
  totalPages,
  from,
  to,
  onPageChange,
  onEditUser,
  onDeleteUser,
}: UsersTableProps) {
  const t = useTranslations("admin");

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border bg-muted px-5 py-4">
        <h2 className="text-xl font-bold text-primary">
          {t("users.systemUsers")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("users.systemUsersDescription")}
        </p>
      </div>

      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-start">
            <thead className="border-b border-border bg-card text-sm text-muted-foreground">
              <tr>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("users.table.user")}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("users.table.role")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("users.table.status")}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("users.table.lastLogin")}
                </th>
                <th className="px-5 py-4 text-start font-semibold">
                  {t("users.table.createdAt")}
                </th>
                <th className="px-5 py-4 text-center font-semibold">
                  {t("users.table.actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <UsersTableRow
                  key={user.id}
                  user={user}
                  onEdit={() => onEditUser(user)}
                  onDelete={() => onDeleteUser(user.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-10 text-center">
          <h2 className="text-xl font-bold text-primary">
            {t("users.noResultsTitle")}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t("users.noResultsDescription")}
          </p>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 border-t border-border bg-muted px-5 py-4 sm:flex-row sm:items-center">
        <span className="text-sm text-muted-foreground">
          {t("users.paginationInfo", {
            from,
            to,
            total: totalUsers,
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
              {t("users.previous")}
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
              {t("users.next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
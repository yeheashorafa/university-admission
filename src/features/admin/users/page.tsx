"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { updateSearchParams } from "@/lib/url-search-params";
import { AdminUsersHeader } from "./components/admin-users-header";
import { UsersStats } from "./components/users-stats";
import { UsersFilterBar } from "./components/users-filter-bar";
import { UsersTable } from "./components/users-table";
import { UserFormModal } from "./components/user-form-modal";
import {
  useAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
} from "@/hooks/queries/use-admin-users-queries";
import { extractApiError } from "@/lib/api/api-error";
import type { AuthUser, UserRole } from "@/services/auth.service";
import type { AdminUserPayload } from "@/services/admin-users.service";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { userRoles } from "@/constants/roles";

const PAGE_SIZE = 4;

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "");
}

export function AdminUsersPage() {
  const t = useTranslations("admin");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { role: currentUserRole } = useCurrentAuth();
  const isDeptHead = currentUserRole === userRoles.departmentHead;

  const search = searchParams.get("search") ?? "";
  const role = (searchParams.get("role") || undefined) as UserRole | undefined;
  const page = Number(searchParams.get("page") ?? "1");

  const {
    data: apiUsers,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminUsersQuery({ search, role });
  const createMutation = useCreateAdminUserMutation();
  const updateMutation = useUpdateAdminUserMutation();
  const deleteMutation = useDeleteAdminUserMutation();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);

  const users: AuthUser[] = useMemo(() => {
    return Array.isArray(apiUsers) ? apiUsers : [];
  }, [apiUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = normalizeSearchText(search);
      const searchableText = normalizeSearchText(
        [user.name, user.email, user.role, user.phone].join(" ")
      );
      const matchesSearch = !searchValue || searchableText.includes(searchValue);
      const matchesRole = !role || user.role === role;
      return matchesSearch && matchesRole;
    });
  }, [users, search, role]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paginatedUsers = filteredUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const from = filteredUsers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filteredUsers.length);

  function pushParams(updates: Record<string, string | number | null>) {
    const query = updateSearchParams(searchParams, updates);
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleSearchChange(value: string) {
    pushParams({ search: value, page: 1 });
  }

  function handleFilterChange(key: string, value: string) {
    pushParams({ [key]: value === "all" ? "" : value, page: 1 });
  }

  function handleReset() {
    router.push(pathname);
  }

  function handlePageChange(nextPage: number) {
    pushParams({ page: nextPage });
  }

  function handleOpenCreate() {
    setModalMode("create");
    setEditingUser(null);
    setModalOpen(true);
  }

  function handleOpenEdit(user: AuthUser) {
    setModalMode("edit");
    setEditingUser(user);
    setModalOpen(true);
  }

  async function handleSubmitUser(payload: AdminUserPayload, id?: string | number) {
    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync(payload);

        await Swal.fire({
          title: t("users.successTitle"),
          text: t("users.createdSuccessfully"),
          icon: "success",
          confirmButtonText: t("users.ok"),
        });
      } else if (id) {
        await updateMutation.mutateAsync({
          userId: String(id),
          payload,
        });

        await Swal.fire({
          title: t("users.successTitle"),
          text: t("users.updatedSuccessfully"),
          icon: "success",
          confirmButtonText: t("users.ok"),
        });
      }
      
      setModalOpen(false);
      setEditingUser(null);
      
      // Ensure the table refreshes
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      refetch();
    } catch (err) {
      const apiErr = extractApiError(err);
      let errorMsg = apiErr.message;
      if (apiErr.status === 422 && apiErr.errors) {
        const firstError = Object.values(apiErr.errors)[0]?.[0];
        if (firstError) {
          errorMsg = firstError;
        }
      }

      await Swal.fire({
        title: "خطأ",
        text: errorMsg,
        icon: "error",
      });
    }
  }

  async function handleDeleteUser(userId: string | number) {
    const result = await Swal.fire({
      title: t("users.deleteConfirmTitle"),
      text: t("users.deleteConfirmDescription"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("users.delete"),
      cancelButtonText: t("users.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(String(userId));
      await Swal.fire({
        title: t("users.successTitle"),
        text: t("users.deletedSuccessfully"),
        icon: "success",
        confirmButtonText: t("users.ok"),
      });
    } catch (err) {
      const apiErr = extractApiError(err);
      await Swal.fire({
        title: "خطأ",
        text: apiErr.message,
        icon: "error",
      });
    }
  }

  return (
    <AdminLayout activePath={routes.adminUsers}>
      <div className="flex flex-col gap-8">
        <AdminUsersHeader onAddUser={handleOpenCreate} />

        {isDeptHead && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200">
            <AlertCircle className="size-5 shrink-0" />
            <p className="text-sm font-medium">
              تم الإبقاء على صلاحية إدارة موظفي القسم وظيفياً. بانتظار توفير نقطة نهاية مخصصة من الخادم (مثل <code>/api/v1/department_head/users</code>) حيث أن مسار <code>/admin/users</code> مقتصر على مشرف النظام.
            </p>
          </div>
        )}

        <UsersStats users={users} />

        <UsersFilterBar
          search={search}
          role={role ?? ""}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {isLoading ? (
          <div className="rounded-[28px] border border-border bg-card p-12 text-center text-muted-foreground">
            جاري تحميل قائمة المستخدمين من الخادم...
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center text-destructive">
            <AlertCircle className="size-10" />
            <h3 className="text-lg font-bold">
              {isDeptHead
                ? "إدارة موظفي القسم تتطلب نقطة نهاية مخصصة بالخادم"
                : "تعذر تحميل بيانات المستخدمين"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-lg">
              {isDeptHead
                ? "تم الحفاظ على الصلاحية في الواجهة، لكن مسار /api/v1/admin/users يرفض طلب رئيس القسم حالياً (403 Forbidden). نحتاج Backend endpoint مناسباً (مثل /api/v1/department_head/users)."
                : error instanceof Error
                  ? error.message
                  : "حدث خطأ أثناء استرجاع المستخدمين من الخادم."}
            </p>
            {!isDeptHead && (
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        ) : (
          <UsersTable
            users={paginatedUsers}
            totalUsers={filteredUsers.length}
            currentPage={safePage}
            totalPages={totalPages}
            from={from}
            to={to}
            onPageChange={handlePageChange}
            onEditUser={handleOpenEdit}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </div>

      <UserFormModal
        open={modalOpen}
        mode={modalMode}
        user={editingUser}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitUser}
      />
    </AdminLayout>
  );
}
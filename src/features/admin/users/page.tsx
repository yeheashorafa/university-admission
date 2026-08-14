"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { AuthUser, UserRole } from "@/services/auth.service";
import type { AdminUserPayload } from "@/services/admin-users.service";

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

  const search = searchParams.get("search") ?? "";
  const role = (searchParams.get("role") || undefined) as UserRole | undefined;
  const page = Number(searchParams.get("page") ?? "1");

  const { data: apiUsers } = useAdminUsersQuery({ search, role });
  const createMutation = useCreateAdminUserMutation();
  const updateMutation = useUpdateAdminUserMutation();
  const deleteMutation = useDeleteAdminUserMutation();

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
    } catch (err) {
      await Swal.fire({
        title: "خطأ",
        text: getApiErrorMessage(err),
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
      await Swal.fire({
        title: "خطأ",
        text: getApiErrorMessage(err),
        icon: "error",
      });
    }
  }

  return (
    <AdminLayout activePath={routes.adminUsers}>
      <div className="flex flex-col gap-8">
        <AdminUsersHeader onAddUser={handleOpenCreate} />

        <UsersStats users={users} />

        <UsersFilterBar
          search={search}
          role={role ?? ""}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

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
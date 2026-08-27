"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { updateSearchParams } from "@/lib/url-search-params";
import { DepartmentsHeader } from "./components/departments-header";
import { DepartmentsStats } from "./components/departments-stats";
import { DepartmentsTable } from "./components/departments-table";
import { DepartmentFormModal } from "./components/department-form-modal";
import type { Department, DepartmentFormValues } from "./data/departments.data";
import { DepartmentsFilterBar } from "./components/departments-filter-bar";
import {
  useAdminDepartmentsQuery,
  useAdminFacultiesQuery,
  useCreateAdminDepartmentMutation,
  useUpdateAdminDepartmentMutation,
  useDeleteAdminDepartmentMutation,
} from "@/hooks/queries";
import { type AdminFaculty } from "@/services/admin.service";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const PAGE_SIZE = 8;

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "");
}

export function DepartmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("admin");

  const { data: apiDepartments } = useAdminDepartmentsQuery();
  const { data: apiFaculties } = useAdminFacultiesQuery();

  const createMutation = useCreateAdminDepartmentMutation();
  const updateMutation = useUpdateAdminDepartmentMutation();
  const deleteMutation = useDeleteAdminDepartmentMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const facultyMap = useMemo(() => {
    const map = new Map<string, string>();
    (Array.isArray(apiFaculties) ? apiFaculties : []).forEach((item) => {
      const f = item as AdminFaculty;
      map.set(
        String(f.id),
        String(f.name_en || f.name_ar || f.name || f.id)
      );
    });
    return map;
  }, [apiFaculties]);

  const departments: Department[] = useMemo(() => {
    const list = Array.isArray(apiDepartments) ? apiDepartments : [];
    return list.map((item) => {
      const d = item as Record<string, unknown>;
      return {
        id: String(d.id),
        faculty_id: d.faculty_id as string | number,
        name_en: String(d.name_en || d.name || ""),
        name_ar: String(d.name_ar || d.name || ""),
        description_en: (d.description_en as string | undefined) ?? undefined,
        description_ar: (d.description_ar as string | undefined) ?? undefined,
        is_active: d.is_active !== false,
        facultyName: facultyMap.get(String(d.faculty_id)) ?? undefined,
      };
    });
  }, [apiDepartments, facultyMap]);

  const filteredDepartments = useMemo(() => {
    const searchValue = normalizeSearchText(search);
    return departments.filter((department) => {
      const searchableText = normalizeSearchText(
        [department.name_en, department.name_ar, department.facultyName ?? ""].join(
          " "
        )
      );
      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);
      const matchesStatus =
        !status ||
        (status === "active"
          ? department.is_active
          : !department.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [departments, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDepartments.length / PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paginatedDepartments = filteredDepartments.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const from =
    filteredDepartments.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filteredDepartments.length);

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
    setEditingDepartment(null);
    setModalOpen(true);
  }

  function handleOpenEdit(department: Department) {
    setModalMode("edit");
    setEditingDepartment(department);
    setModalOpen(true);
  }

  async function handleSubmitDepartment(values: DepartmentFormValues) {
    const payload = {
      faculty_id: Number(values.faculty_id),
      name_en: values.name_en,
      name_ar: values.name_ar,
      description_en: values.description_en,
      description_ar: values.description_ar,
      is_active: values.is_active,
    };

    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync(payload);
        toast.success(t("departments.createdSuccessfully"));
      } else if (values.id) {
        await updateMutation.mutateAsync({
          departmentId: values.id,
          payload,
        });
        toast.success(t("departments.updatedSuccessfully"));
      }
      setModalOpen(false);
      setEditingDepartment(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleDeleteDepartment(departmentId: string | number) {
    const result = await Swal.fire({
      title: t("departments.deleteConfirmTitle"),
      text: t("departments.deleteConfirmDescription"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("departments.delete"),
      cancelButtonText: t("departments.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(departmentId);
      toast.success(t("departments.deletedSuccessfully"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleToggleStatus(department: Department) {
    const nextActive = !department.is_active;

    try {
      await updateMutation.mutateAsync({
        departmentId: department.id,
        payload: {
          faculty_id: Number(department.faculty_id),
          name_en: department.name_en,
          name_ar: department.name_ar,
          description_en: department.description_en,
          description_ar: department.description_ar,
          is_active: nextActive,
        },
      });
      toast.success(t("departments.statusUpdated"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <AdminLayout activePath={routes.adminDepartments}>
      <div className="flex flex-col gap-8">
        <DepartmentsHeader onAddDepartment={handleOpenCreate} />

        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center">
            <p className="text-lg font-bold text-muted-foreground">
              لا توجد بيانات من الخادم حالياً
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              No data is currently available from the server.
            </p>
          </div>
        ) : (
          <>
            <DepartmentsStats departments={departments} />

            <DepartmentsFilterBar
              search={search}
              status={status}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />

            <DepartmentsTable
              departments={paginatedDepartments}
              totalDepartments={filteredDepartments.length}
              currentPage={safePage}
              totalPages={totalPages}
              from={from}
              to={to}
              onPageChange={handlePageChange}
              onEditDepartment={handleOpenEdit}
              onDeleteDepartment={handleDeleteDepartment}
              onToggleStatus={handleToggleStatus}
            />
          </>
        )}
      </div>

      <DepartmentFormModal
        open={modalOpen}
        mode={modalMode}
        department={editingDepartment}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDepartment}
      />
    </AdminLayout>
  );
}

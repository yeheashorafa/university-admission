"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { updateSearchParams } from "@/lib/url-search-params";
import { FacultiesHeader } from "./components/faculties-header";
import { FacultiesStats } from "./components/faculties-stats";
import { FacultiesTable } from "./components/faculties-table";
import { FacultyFormModal } from "./components/faculty-form-modal";
import type { Faculty, FacultyFormValues } from "./data/faculties.data";
import { FacultiesFilterBar } from "./components/faculties-filter-bar";
import {
  useAdminFacultiesQuery,
  useCreateAdminFacultyMutation,
  useUpdateAdminFacultyMutation,
  useDeleteAdminFacultyMutation,
} from "@/hooks/queries";
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

export function FacultiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("admin");

  const { data: apiFaculties } = useAdminFacultiesQuery();

  const createMutation = useCreateAdminFacultyMutation();
  const updateMutation = useUpdateAdminFacultyMutation();
  const deleteMutation = useDeleteAdminFacultyMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const faculties: Faculty[] = useMemo(() => {
    const list = Array.isArray(apiFaculties) ? apiFaculties : [];
    return list.map((item) => {
      const f = item as Record<string, unknown>;
      return {
        id: String(f.id),
        name_en: String(f.name_en || f.name || ""),
        name_ar: String(f.name_ar || f.name || ""),
        description_en: (f.description_en as string | undefined) ?? undefined,
        description_ar: (f.description_ar as string | undefined) ?? undefined,
        is_active: f.is_active !== false,
      };
    });
  }, [apiFaculties]);

  const filteredFaculties = useMemo(() => {
    const searchValue = normalizeSearchText(search);
    return faculties.filter((faculty) => {
      const searchableText = normalizeSearchText(
        [faculty.name_en, faculty.name_ar].join(" ")
      );
      const matchesSearch = !searchValue || searchableText.includes(searchValue);
      const matchesStatus =
        !status ||
        (status === "active" ? faculty.is_active : !faculty.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [faculties, search, status]);

  const totalPages = Math.max(1, Math.ceil(filteredFaculties.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paginatedFaculties = filteredFaculties.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const from =
    filteredFaculties.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filteredFaculties.length);

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
    setEditingFaculty(null);
    setModalOpen(true);
  }

  function handleOpenEdit(faculty: Faculty) {
    setModalMode("edit");
    setEditingFaculty(faculty);
    setModalOpen(true);
  }

  async function handleSubmitFaculty(values: FacultyFormValues) {
    const payload = {
      name_en: values.name_en,
      name_ar: values.name_ar,
      description_en: values.description_en,
      description_ar: values.description_ar,
      is_active: values.is_active,
    };

    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync(payload);
        toast.success(t("faculties.createdSuccessfully"));
      } else if (values.id) {
        await updateMutation.mutateAsync({
          facultyId: values.id,
          payload,
        });
        toast.success(t("faculties.updatedSuccessfully"));
      }
      setModalOpen(false);
      setEditingFaculty(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleDeleteFaculty(facultyId: string | number) {
    const result = await Swal.fire({
      title: t("faculties.deleteConfirmTitle"),
      text: t("faculties.deleteConfirmDescription"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("faculties.delete"),
      cancelButtonText: t("faculties.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(facultyId);
      toast.success(t("faculties.deletedSuccessfully"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleToggleStatus(faculty: Faculty) {
    const nextActive = !faculty.is_active;

    try {
      await updateMutation.mutateAsync({
        facultyId: faculty.id,
        payload: {
          name_en: faculty.name_en,
          name_ar: faculty.name_ar,
          description_en: faculty.description_en,
          description_ar: faculty.description_ar,
          is_active: nextActive,
        },
      });
      toast.success(t("faculties.statusUpdated"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <AdminLayout activePath={routes.adminFaculties}>
      <div className="flex flex-col gap-8">
        <FacultiesHeader onAddFaculty={handleOpenCreate} />

        {faculties.length === 0 ? (
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
            <FacultiesStats faculties={faculties} />

            <FacultiesFilterBar
              search={search}
              status={status}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />

            <FacultiesTable
              faculties={paginatedFaculties}
              totalFaculties={filteredFaculties.length}
              currentPage={safePage}
              totalPages={totalPages}
              from={from}
              to={to}
              onPageChange={handlePageChange}
              onEditFaculty={handleOpenEdit}
              onDeleteFaculty={handleDeleteFaculty}
              onToggleStatus={handleToggleStatus}
            />
          </>
        )}
      </div>

      <FacultyFormModal
        open={modalOpen}
        mode={modalMode}
        faculty={editingFaculty}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitFaculty}
      />
    </AdminLayout>
  );
}

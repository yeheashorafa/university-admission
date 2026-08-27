"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { updateSearchParams } from "@/lib/url-search-params";
import { AdminProgramsHeader } from "./components/admin-programs-header";
import { AdminProgramsStats } from "./components/admin-programs-stats";
import { AdminProgramsTable } from "./components/admin-programs-table";
import { AdminProgramFormModal } from "./components/admin-program-form-modal";
import {
  type AcademicBranch,
  type AdminProgram,
  type AdminProgramStatus,
} from "./data/admin-programs.data";
import { AdminProgramsFilterBar } from "./components/admin-programs-filter-bar";

import { useAdminMasterCatalogProgramsQuery } from "@/hooks/queries/use-admin-queries";
import {
  useCreateAdminProgramMutation,
  useUpdateAdminProgramMutation,
  useDeleteAdminProgramMutation,
} from "@/hooks/queries/use-admin-programs-queries";
import { type AdminProgramPayload } from "@/services/admin-programs.service";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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

export function AdminProgramsPage() {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: apiPrograms } = useAdminMasterCatalogProgramsQuery();
  const t = useTranslations("admin");

  const createProgramMutation = useCreateAdminProgramMutation();
  const updateProgramMutation = useUpdateAdminProgramMutation();
  const deleteProgramMutation = useDeleteAdminProgramMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProgram, setEditingProgram] = useState<AdminProgram | null>(null);

  const search = searchParams.get("search") ?? "";
  const faculty = searchParams.get("faculty") ?? "";
  const status = searchParams.get("status") ?? "";
  const branch = searchParams.get("branch") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const programs: AdminProgram[] = useMemo(() => {
    const list = Array.isArray(apiPrograms) ? apiPrograms : [];
    if (list.length === 0) return [];

    return list.map((item) => {
      const p = item as Record<string, unknown>;
      return {
        id: String(p.id),
        title: String(p.name_ar || p.name || p.title || "برنامج أكاديمي"),
        faculty: String(p.faculty_name || p.faculty || "الكلية"),
        degree: String(p.degree || "Bachelor"),
        duration: `${p.duration_years || 4} سنوات`,
        status: (p.is_active === false ? "inactive" : "active") as AdminProgramStatus,
        minimumRate: Number(p.minimum_average || p.min_rate || 70),
        capacity: Number(p.capacity || 100),
        applicationsCount: Number(p.applications_count || 0),
        acceptedCount: Number(p.accepted_count || 0),
        departmentId: p.department_id != null ? String(p.department_id) : undefined,
        facultyId: p.faculty_id != null ? String(p.faculty_id) : undefined,
        branches: Array.isArray(p.branches)
          ? (p.branches.map((b) =>
              String((b as { id?: string | number }).id ?? b)
            ) as unknown as AcademicBranch[])
          : [],
      };
    });
  }, [apiPrograms]);

  const faculties = useMemo(() => {
    return Array.from(new Set(programs.map((program) => program.faculty)));
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      const searchValue = normalizeSearchText(search);

      const searchableText = normalizeSearchText(
        [
          program.title,
          program.faculty,
          program.degree,
          program.duration,
        ].join(" ")
      );

      const matchesSearch = !searchValue || searchableText.includes(searchValue);
      const matchesFaculty = !faculty || program.faculty === faculty;
      const matchesStatus = !status || program.status === (status as AdminProgramStatus);
      const matchesBranch = !branch || program.branches.includes(branch as AcademicBranch);

      return matchesSearch && matchesFaculty && matchesStatus && matchesBranch;
    });
  }, [programs, search, faculty, status, branch]);

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paginatedPrograms = filteredPrograms.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const from = filteredPrograms.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filteredPrograms.length);

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
    setEditingProgram(null);
    setModalOpen(true);
  }

  function handleOpenEdit(program: AdminProgram) {
    setModalMode("edit");
    setEditingProgram(program);
    setModalOpen(true);
  }

  async function handleSubmitProgram(program: AdminProgram) {
    const payload: AdminProgramPayload = {
      department_id: Number(program.departmentId),
      name_en: program.title,
      name_ar: program.title,
      minimum_average: program.minimumRate,
      is_active: program.status === "active",
    };

    try {
      if (modalMode === "create") {
        await createProgramMutation.mutateAsync(payload);
      } else if (program.id) {
        await updateProgramMutation.mutateAsync({ programId: program.id, payload });
      }
      setModalOpen(false);
      setEditingProgram(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleDeleteProgram(programId: string) {
    const result = await Swal.fire({
      title: t("programs.deleteConfirmTitle") ?? "Delete program?",
      text:
        t("programs.deleteConfirmDescription") ??
        "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("programs.delete") ?? "Delete",
      cancelButtonText: t("programs.cancel") ?? "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProgramMutation.mutateAsync(programId);
      toast.success(t("programs.deletedSuccessfully") ?? "Program deleted.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleToggleStatus(program: AdminProgram) {
    const nextActive = program.status === "inactive" || program.status === "closed";

    try {
      await updateProgramMutation.mutateAsync({
        programId: program.id,
        payload: {
          department_id:
            program.departmentId != null ? Number(program.departmentId) : undefined,
          name_en: program.title,
          name_ar: program.title,
          minimum_average: program.minimumRate,
          is_active: nextActive,
        },
      });
      toast.success(t("programs.statusUpdated") ?? "Program status updated.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <AdminLayout activePath={routes.adminPrograms}>
      <div className="flex flex-col gap-8">
        <AdminProgramsHeader onAddProgram={handleOpenCreate} />

        {programs.length === 0 ? (
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
            <AdminProgramsStats programs={programs} />

            <AdminProgramsFilterBar
              search={search}
              faculty={faculty}
              status={status}
              branch={branch}
              faculties={faculties}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />

            <AdminProgramsTable
              programs={paginatedPrograms}
              totalPrograms={filteredPrograms.length}
              currentPage={safePage}
              totalPages={totalPages}
              from={from}
              to={to}
              onPageChange={handlePageChange}
              onEditProgram={handleOpenEdit}
              onDeleteProgram={handleDeleteProgram}
              onToggleStatus={handleToggleStatus}
            />
          </>
        )}
      </div>

      <AdminProgramFormModal
        open={modalOpen}
        mode={modalMode}
        program={editingProgram}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitProgram}
      />
    </AdminLayout>
  );
}
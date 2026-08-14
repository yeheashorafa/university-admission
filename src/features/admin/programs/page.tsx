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
        branches: Array.isArray(p.branches) ? (p.branches as AcademicBranch[]) : ["scientific"],
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
    Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "Endpoint documented but not enabled in current backend deployment.",
      icon: "info",
    });
  }

  function handleOpenEdit(program: AdminProgram) {
    setModalMode("edit");
    setEditingProgram(program);
    setModalOpen(true);
  }

  async function handleSubmitProgram() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "Endpoint documented but not enabled in current backend deployment.",
      icon: "info",
    });
    setModalOpen(false);
    setEditingProgram(null);
  }

  async function handleDeleteProgram() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "Endpoint documented but not enabled in current backend deployment.",
      icon: "info",
    });
  }

  async function handleToggleStatus() {
    await Swal.fire({
      title: "عملية معلقة (PENDING_BACKEND_API)",
      text: "Endpoint documented but not enabled in current backend deployment.",
      icon: "info",
    });
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
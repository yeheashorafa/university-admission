"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { updateSearchParams } from "@/lib/url-search-params";
import { ApplicationTypesHeader } from "./components/application-types-header";
import { ApplicationTypesStats } from "./components/application-types-stats";
import { ApplicationTypesTable } from "./components/application-types-table";
import { ApplicationTypeFormModal } from "./components/application-type-form-modal";
import type {
  ApplicationType,
  ApplicationTypeFormValues,
} from "./data/application-types.data";
import { ApplicationTypesFilterBar } from "./components/application-types-filter-bar";
import {
  useAdminApplicationTypesQuery,
  useUpdateAdminApplicationTypeMutation,
  useDeleteAdminApplicationTypeMutation,
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

export function ApplicationTypesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("admin");

  const { data: apiApplicationTypes } = useAdminApplicationTypesQuery();

  const updateMutation = useUpdateAdminApplicationTypeMutation();
  const deleteMutation = useDeleteAdminApplicationTypeMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("edit");
  const [editingApplicationType, setEditingApplicationType] =
    useState<ApplicationType | null>(null);

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const applicationTypes: ApplicationType[] = useMemo(() => {
    const list = Array.isArray(apiApplicationTypes) ? apiApplicationTypes : [];
    return list.map((item) => {
      const d = item as Record<string, unknown>;
      return {
        id: String(d.id),
        code: String(d.code || ""),
        name_en: String(d.name_en || ""),
        name_ar: String(d.name_ar || ""),
        requires_department_head_approval: Boolean(
          d.requires_department_head_approval
        ),
        is_active: d.is_active !== false,
      };
    });
  }, [apiApplicationTypes]);

  const filteredApplicationTypes = useMemo(() => {
    const searchValue = normalizeSearchText(search);
    return applicationTypes.filter((applicationType) => {
      const searchableText = normalizeSearchText(
        [
          applicationType.code,
          applicationType.name_en,
          applicationType.name_ar,
        ].join(" ")
      );
      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);
      const matchesStatus =
        !status ||
        (status === "active"
          ? applicationType.is_active
          : !applicationType.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [applicationTypes, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplicationTypes.length / PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paginatedApplicationTypes = filteredApplicationTypes.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const from =
    filteredApplicationTypes.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filteredApplicationTypes.length);

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

  function handleOpenEdit(applicationType: ApplicationType) {
    setModalMode("edit");
    setEditingApplicationType(applicationType);
    setModalOpen(true);
  }

  async function handleSubmitApplicationType(
    values: ApplicationTypeFormValues
  ) {
    const payload = {
      code: values.code,
      name_en: values.name_en,
      name_ar: values.name_ar,
      requires_department_head_approval: values.requires_department_head_approval,
      is_active: values.is_active,
    };

    try {
      if (values.id) {
        await updateMutation.mutateAsync({
          applicationTypeId: values.id,
          payload,
        });
        toast.success(t("applicationTypes.updatedSuccessfully"));
      }
      setModalOpen(false);
      setEditingApplicationType(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleDeleteApplicationType(
    applicationTypeId: string | number
  ) {
    const result = await Swal.fire({
      title: t("applicationTypes.deleteConfirmTitle"),
      text: t("applicationTypes.deleteConfirmDescription"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("applicationTypes.delete"),
      cancelButtonText: t("applicationTypes.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(applicationTypeId);
      toast.success(t("applicationTypes.deletedSuccessfully"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleToggleStatus(applicationType: ApplicationType) {
    const nextActive = !applicationType.is_active;

    try {
      await updateMutation.mutateAsync({
        applicationTypeId: applicationType.id,
        payload: {
          code: applicationType.code,
          name_en: applicationType.name_en,
          name_ar: applicationType.name_ar,
          requires_department_head_approval:
            applicationType.requires_department_head_approval,
          is_active: nextActive,
        },
      });
      toast.success(t("applicationTypes.statusUpdated"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <AdminLayout activePath={routes.adminApplicationTypes}>
      <div className="flex flex-col gap-8">
        <ApplicationTypesHeader />

        {applicationTypes.length === 0 ? (
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
            <ApplicationTypesStats applicationTypes={applicationTypes} />

            <ApplicationTypesFilterBar
              search={search}
              status={status}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />

            <ApplicationTypesTable
              applicationTypes={paginatedApplicationTypes}
              totalApplicationTypes={filteredApplicationTypes.length}
              currentPage={safePage}
              totalPages={totalPages}
              from={from}
              to={to}
              onPageChange={handlePageChange}
              onEditApplicationType={handleOpenEdit}
              onDeleteApplicationType={handleDeleteApplicationType}
              onToggleStatus={handleToggleStatus}
            />
          </>
        )}
      </div>

      <ApplicationTypeFormModal
        open={modalOpen}
        mode={modalMode}
        applicationType={editingApplicationType}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitApplicationType}
      />
    </AdminLayout>
  );
}

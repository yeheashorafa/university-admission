"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { updateSearchParams } from "@/lib/url-search-params";
import { DocumentTypesHeader } from "./components/document-types-header";
import { DocumentTypesStats } from "./components/document-types-stats";
import { DocumentTypesTable } from "./components/document-types-table";
import { DocumentTypeFormModal } from "./components/document-type-form-modal";
import type {
  DocumentType,
  DocumentTypeFormValues,
} from "./data/document-types.data";
import { DocumentTypesFilterBar } from "./components/document-types-filter-bar";
import {
  useAdminDocumentTypesQuery,
  useCreateAdminDocumentTypeMutation,
  useUpdateAdminDocumentTypeMutation,
  useDeleteAdminDocumentTypeMutation,
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

export function DocumentTypesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("admin");

  const { data: apiDocumentTypes } = useAdminDocumentTypesQuery();

  const createMutation = useCreateAdminDocumentTypeMutation();
  const updateMutation = useUpdateAdminDocumentTypeMutation();
  const deleteMutation = useDeleteAdminDocumentTypeMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingDocumentType, setEditingDocumentType] =
    useState<DocumentType | null>(null);

  const search = searchParams.get("search") ?? "";
  const required = searchParams.get("required") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  const documentTypes: DocumentType[] = useMemo(() => {
    const list = Array.isArray(apiDocumentTypes) ? apiDocumentTypes : [];
    return list.map((item) => {
      const d = item as Record<string, unknown>;
      return {
        id: String(d.id),
        name: String(d.name || ""),
        display_name_en: String(d.display_name_en || ""),
        display_name_ar: String(d.display_name_ar || ""),
        description: d.description ? String(d.description) : undefined,
        is_required: Boolean(d.is_required),
      };
    });
  }, [apiDocumentTypes]);

  const filteredDocumentTypes = useMemo(() => {
    const searchValue = normalizeSearchText(search);
    return documentTypes.filter((documentType) => {
      const searchableText = normalizeSearchText(
        [
          documentType.name,
          documentType.display_name_en,
          documentType.display_name_ar,
        ].join(" ")
      );
      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);
      const matchesRequired =
        !required ||
        (required === "required"
          ? documentType.is_required
          : !documentType.is_required);
      return matchesSearch && matchesRequired;
    });
  }, [documentTypes, search, required]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocumentTypes.length / PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const paginatedDocumentTypes = filteredDocumentTypes.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const from =
    filteredDocumentTypes.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, filteredDocumentTypes.length);

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
    setEditingDocumentType(null);
    setModalOpen(true);
  }

  function handleOpenEdit(documentType: DocumentType) {
    setModalMode("edit");
    setEditingDocumentType(documentType);
    setModalOpen(true);
  }

  async function handleSubmitDocumentType(values: DocumentTypeFormValues) {
    const payload = {
      name: values.name,
      display_name_en: values.display_name_en,
      display_name_ar: values.display_name_ar,
      description: values.description,
      is_required: values.is_required,
    };

    try {
      if (modalMode === "create") {
        await createMutation.mutateAsync(payload);
        toast.success(t("documentTypes.createdSuccessfully"));
      } else if (values.id) {
        await updateMutation.mutateAsync({
          documentTypeId: values.id,
          payload,
        });
        toast.success(t("documentTypes.updatedSuccessfully"));
      }
      setModalOpen(false);
      setEditingDocumentType(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleDeleteDocumentType(documentTypeId: string | number) {
    const result = await Swal.fire({
      title: t("documentTypes.deleteConfirmTitle"),
      text: t("documentTypes.deleteConfirmDescription"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("documentTypes.delete"),
      cancelButtonText: t("documentTypes.cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(documentTypeId);
      toast.success(t("documentTypes.deletedSuccessfully"));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <AdminLayout activePath={routes.adminDocumentTypes}>
      <div className="flex flex-col gap-8">
        <DocumentTypesHeader onAddDocumentType={handleOpenCreate} />

        {documentTypes.length === 0 ? (
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
            <DocumentTypesStats documentTypes={documentTypes} />

            <DocumentTypesFilterBar
              search={search}
              required={required}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />

            <DocumentTypesTable
              documentTypes={paginatedDocumentTypes}
              totalDocumentTypes={filteredDocumentTypes.length}
              currentPage={safePage}
              totalPages={totalPages}
              from={from}
              to={to}
              onPageChange={handlePageChange}
              onEditDocumentType={handleOpenEdit}
              onDeleteDocumentType={handleDeleteDocumentType}
            />
          </>
        )}
      </div>

      <DocumentTypeFormModal
        open={modalOpen}
        mode={modalMode}
        documentType={editingDocumentType}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitDocumentType}
      />
    </AdminLayout>
  );
}

"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Department, DepartmentFormValues } from "../data/departments.data";
import { useAdminFacultiesQuery } from "@/hooks/queries";

type DepartmentFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  department?: Department | null;
  onClose: () => void;
  onSubmit: (values: DepartmentFormValues) => void;
};

export function DepartmentFormModal({
  open,
  mode,
  department,
  onClose,
  onSubmit,
}: DepartmentFormModalProps) {
  if (!open) return null;

  return (
    <DepartmentFormModalContent
      key={`${mode}-${department?.id ?? "new"}`}
      mode={mode}
      department={department}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

type DepartmentFormModalContentProps = {
  mode: "create" | "edit";
  department?: Department | null;
  onClose: () => void;
  onSubmit: (values: DepartmentFormValues) => void;
};

function DepartmentFormModalContent({
  mode,
  department,
  onClose,
  onSubmit,
}: DepartmentFormModalContentProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const { data: facultyList = [] } = useAdminFacultiesQuery();

  const facultyOptions = facultyList.map((faculty) => {
    const f = faculty as { id: string | number; name_en?: string; name_ar?: string; name?: string };
    return {
      value: String(f.id),
      label:
        locale === "ar"
          ? f.name_ar || f.name_en || f.name || String(f.id)
          : f.name_en || f.name_ar || f.name || String(f.id),
    };
  });

  const [facultyId, setFacultyId] = useState(
    department?.faculty_id ? String(department.faculty_id) : ""
  );
  const [nameEn, setNameEn] = useState(department?.name_en ?? "");
  const [nameAr, setNameAr] = useState(department?.name_ar ?? "");
  const [descriptionEn, setDescriptionEn] = useState(
    department?.description_en ?? ""
  );
  const [descriptionAr, setDescriptionAr] = useState(
    department?.description_ar ?? ""
  );
  const [isActive, setIsActive] = useState(department?.is_active ?? true);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      id: department?.id,
      faculty_id: facultyId,
      name_en: nameEn,
      name_ar: nameAr,
      description_en: descriptionEn,
      description_ar: descriptionAr,
      is_active: isActive,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === "create"
                ? t("departments.createTitle")
                : t("departments.updateTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("departments.formDescription")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label={t("departments.form.faculty")}>
              <select
                required
                value={facultyId}
                onChange={(event) => setFacultyId(event.target.value)}
                disabled={facultyList.length === 0}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="" disabled>
                  {facultyList.length === 0
                    ? t("departments.formSelectFacultyFirst")
                    : t("departments.formSelectFaculty")}
                </option>
                {facultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label={t("departments.form.nameEn")}>
              <input
                required
                value={nameEn}
                onChange={(event) => setNameEn(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("departments.form.nameAr")}>
              <input
                required
                value={nameAr}
                onChange={(event) => setNameAr(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("departments.form.descriptionEn")}>
              <textarea
                value={descriptionEn}
                onChange={(event) => setDescriptionEn(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("departments.form.descriptionAr")}>
              <textarea
                value={descriptionAr}
                onChange={(event) => setDescriptionAr(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            {t("departments.form.isActive")}
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              {t("departments.cancel")}
            </button>

            <button
              type="submit"
              className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {mode === "create" ? t("departments.create") : t("departments.save")}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

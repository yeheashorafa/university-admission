"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Faculty, FacultyFormValues } from "../data/faculties.data";

type FacultyFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  faculty?: Faculty | null;
  onClose: () => void;
  onSubmit: (values: FacultyFormValues) => void;
};

export function FacultyFormModal({
  open,
  mode,
  faculty,
  onClose,
  onSubmit,
}: FacultyFormModalProps) {
  if (!open) return null;

  return (
    <FacultyFormModalContent
      key={`${mode}-${faculty?.id ?? "new"}`}
      mode={mode}
      faculty={faculty}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

type FacultyFormModalContentProps = {
  mode: "create" | "edit";
  faculty?: Faculty | null;
  onClose: () => void;
  onSubmit: (values: FacultyFormValues) => void;
};

function FacultyFormModalContent({
  mode,
  faculty,
  onClose,
  onSubmit,
}: FacultyFormModalContentProps) {
  const t = useTranslations("admin");

  const [nameEn, setNameEn] = useState(faculty?.name_en ?? "");
  const [nameAr, setNameAr] = useState(faculty?.name_ar ?? "");
  const [descriptionEn, setDescriptionEn] = useState(
    faculty?.description_en ?? ""
  );
  const [descriptionAr, setDescriptionAr] = useState(
    faculty?.description_ar ?? ""
  );
  const [isActive, setIsActive] = useState(faculty?.is_active ?? true);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      id: faculty?.id,
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
                ? t("faculties.createTitle")
                : t("faculties.updateTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("faculties.formDescription")}
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
            <FormField label={t("faculties.form.nameEn")}>
              <input
                required
                value={nameEn}
                onChange={(event) => setNameEn(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("faculties.form.nameAr")}>
              <input
                required
                value={nameAr}
                onChange={(event) => setNameAr(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("faculties.form.descriptionEn")}>
              <textarea
                value={descriptionEn}
                onChange={(event) => setDescriptionEn(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("faculties.form.descriptionAr")}>
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
            {t("faculties.form.isActive")}
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              {t("faculties.cancel")}
            </button>

            <button
              type="submit"
              className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {mode === "create" ? t("faculties.create") : t("faculties.save")}
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

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type {
  DocumentType,
  DocumentTypeFormValues,
} from "../data/document-types.data";

type DocumentTypeFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  documentType?: DocumentType | null;
  onClose: () => void;
  onSubmit: (values: DocumentTypeFormValues) => void;
};

export function DocumentTypeFormModal({
  open,
  mode,
  documentType,
  onClose,
  onSubmit,
}: DocumentTypeFormModalProps) {
  if (!open) return null;

  return (
    <DocumentTypeFormModalContent
      key={`${mode}-${documentType?.id ?? "new"}`}
      mode={mode}
      documentType={documentType}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

type DocumentTypeFormModalContentProps = {
  mode: "create" | "edit";
  documentType?: DocumentType | null;
  onClose: () => void;
  onSubmit: (values: DocumentTypeFormValues) => void;
};

function DocumentTypeFormModalContent({
  mode,
  documentType,
  onClose,
  onSubmit,
}: DocumentTypeFormModalContentProps) {
  const t = useTranslations("admin");

  const [name, setName] = useState(documentType?.name ?? "");
  const [displayNameEn, setDisplayNameEn] = useState(
    documentType?.display_name_en ?? ""
  );
  const [displayNameAr, setDisplayNameAr] = useState(
    documentType?.display_name_ar ?? ""
  );
  const [description, setDescription] = useState(
    documentType?.description ?? ""
  );
  const [isRequired, setIsRequired] = useState(
    documentType?.is_required ?? false
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      id: documentType?.id,
      name,
      display_name_en: displayNameEn,
      display_name_ar: displayNameAr,
      description,
      is_required: isRequired,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === "create"
                ? t("documentTypes.createTitle")
                : t("documentTypes.updateTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("documentTypes.formDescription")}
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
            <FormField label={t("documentTypes.form.name")}>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("documentTypes.form.displayNameEn")}>
              <input
                required
                value={displayNameEn}
                onChange={(event) => setDisplayNameEn(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("documentTypes.form.displayNameAr")}>
              <input
                required
                value={displayNameAr}
                onChange={(event) => setDisplayNameAr(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("documentTypes.form.description")}>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-muted-foreground">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(event) => setIsRequired(event.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary"
            />
            {t("documentTypes.form.isRequired")}
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              {t("documentTypes.cancel")}
            </button>

            <button
              type="submit"
              className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {mode === "create"
                ? t("documentTypes.create")
                : t("documentTypes.save")}
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

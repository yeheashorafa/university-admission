"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type {
  ApplicationType,
  ApplicationTypeFormValues,
} from "../data/application-types.data";

type ApplicationTypeFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  applicationType?: ApplicationType | null;
  onClose: () => void;
  onSubmit: (values: ApplicationTypeFormValues) => void;
};

export function ApplicationTypeFormModal({
  open,
  mode,
  applicationType,
  onClose,
  onSubmit,
}: ApplicationTypeFormModalProps) {
  if (!open) return null;

  return (
    <ApplicationTypeFormModalContent
      key={`${mode}-${applicationType?.id ?? "new"}`}
      mode={mode}
      applicationType={applicationType}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

type ApplicationTypeFormModalContentProps = {
  mode: "create" | "edit";
  applicationType?: ApplicationType | null;
  onClose: () => void;
  onSubmit: (values: ApplicationTypeFormValues) => void;
};

function ApplicationTypeFormModalContent({
  mode,
  applicationType,
  onClose,
  onSubmit,
}: ApplicationTypeFormModalContentProps) {
  const t = useTranslations("admin");

  const [code, setCode] = useState(applicationType?.code ?? "");
  const [nameEn, setNameEn] = useState(applicationType?.name_en ?? "");
  const [nameAr, setNameAr] = useState(applicationType?.name_ar ?? "");
  const [requiresApproval, setRequiresApproval] = useState(
    applicationType?.requires_department_head_approval ?? false
  );
  const [isActive, setIsActive] = useState(
    applicationType?.is_active ?? true
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      id: applicationType?.id,
      code,
      name_en: nameEn,
      name_ar: nameAr,
      requires_department_head_approval: requiresApproval,
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
                ? t("applicationTypes.createTitle")
                : t("applicationTypes.updateTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("applicationTypes.formDescription")}
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
            <FormField label={t("applicationTypes.form.code")}>
              <input
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("applicationTypes.form.nameEn")}>
              <input
                required
                value={nameEn}
                onChange={(event) => setNameEn(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("applicationTypes.form.nameAr")}>
              <input
                required
                value={nameAr}
                onChange={(event) => setNameAr(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
          </div>

          <div className="grid gap-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(event) => setRequiresApproval(event.target.checked)}
                className="size-4 rounded border-input text-primary focus:ring-primary"
              />
              {t("applicationTypes.form.requiresDeptHeadApproval")}
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-4 rounded border-input text-primary focus:ring-primary"
              />
              {t("applicationTypes.form.isActive")}
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              {t("applicationTypes.cancel")}
            </button>

            <button
              type="submit"
              className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {mode === "create"
                ? t("applicationTypes.create")
                : t("applicationTypes.save")}
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

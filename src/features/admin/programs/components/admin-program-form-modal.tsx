"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type {
  AcademicBranch,
  AdminProgram,
  AdminProgramStatus,
} from "../data/admin-programs.data";

type AdminProgramFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  program?: AdminProgram | null;
  onClose: () => void;
  onSubmit: (program: AdminProgram) => void;
};

const branchOptions: AcademicBranch[] = ["scientific", "literary", "industrial"];

export function AdminProgramFormModal({
  open,
  mode,
  program,
  onClose,
  onSubmit,
}: AdminProgramFormModalProps) {
  if (!open) return null;

  return (
    <AdminProgramFormModalContent
      key={`${mode}-${program?.id ?? "new"}`}
      mode={mode}
      program={program}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

type AdminProgramFormModalContentProps = {
  mode: "create" | "edit";
  program?: AdminProgram | null;
  onClose: () => void;
  onSubmit: (program: AdminProgram) => void;
};

function AdminProgramFormModalContent({
  mode,
  program,
  onClose,
  onSubmit,
}: AdminProgramFormModalContentProps) {
  const t = useTranslations("admin");

  const [title, setTitle] = useState(program?.title ?? "");
  const [faculty, setFaculty] = useState(program?.faculty ?? "");
  const [duration, setDuration] = useState(program?.duration ?? "4 years");
  const [minimumRate, setMinimumRate] = useState(program?.minimumRate ?? 70);
  const [capacity, setCapacity] = useState(program?.capacity ?? 100);
  const [status, setStatus] = useState<AdminProgramStatus>(
    program?.status ?? "active"
  );
  const [branches, setBranches] = useState<AcademicBranch[]>(
    program?.branches ?? ["scientific"]
  );

  function toggleBranch(branch: AcademicBranch) {
    setBranches((current) => {
      if (current.includes(branch)) {
        const next = current.filter((item) => item !== branch);
        return next.length > 0 ? next : current;
      }

      return [...current, branch];
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextProgram: AdminProgram = {
      id:
        program?.id ??
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      title,
      faculty,
      degree: "Bachelor",
      duration,
      status,
      minimumRate,
      capacity,
      applicationsCount: program?.applicationsCount ?? 0,
      acceptedCount: program?.acceptedCount ?? 0,
      branches,
    };

    onSubmit(nextProgram);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {mode === "create"
                ? t("programs.createProgram")
                : t("programs.updateProgram")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("programs.programFormDescription")}
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
            <FormField label={t("programs.form.title")}>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("programs.form.faculty")}>
              <input
                required
                value={faculty}
                onChange={(event) => setFaculty(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("programs.form.duration")}>
              <input
                required
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("programs.form.status")}>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as AdminProgramStatus)
                }
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="active">{t("programs.statuses.active")}</option>
                <option value="inactive">
                  {t("programs.statuses.inactive")}
                </option>
                <option value="closed">{t("programs.statuses.closed")}</option>
              </select>
            </FormField>

            <FormField label={t("programs.form.minimumRate")}>
              <input
                required
                type="number"
                min={0}
                max={100}
                value={minimumRate}
                onChange={(event) => setMinimumRate(Number(event.target.value))}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>

            <FormField label={t("programs.form.capacity")}>
              <input
                required
                type="number"
                min={1}
                value={capacity}
                onChange={(event) => setCapacity(Number(event.target.value))}
                className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </FormField>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {t("programs.form.branches")}
            </p>

            <div className="flex flex-wrap gap-3">
              {branchOptions.map((branch) => (
                <label
                  key={branch}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={branches.includes(branch)}
                    onChange={() => toggleBranch(branch)}
                    className="size-4 rounded border-input text-primary focus:ring-primary"
                  />
                  {t(`programs.branches.${branch}`)}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              {t("programs.cancel")}
            </button>

            <button
              type="submit"
              className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {mode === "create" ? t("programs.create") : t("programs.save")}
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
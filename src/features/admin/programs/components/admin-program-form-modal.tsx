"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X } from "lucide-react";
import type {
  AcademicBranch,
  AdminProgram,
  AdminProgramStatus,
} from "../data/admin-programs.data";
import {
  useAdminBranchesQuery,
  useAdminDepartmentsQuery,
  useAdminFacultiesQuery,
} from "@/hooks/queries";

type AdminProgramFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  program?: AdminProgram | null;
  onClose: () => void;
  onSubmit: (program: AdminProgram) => void;
};

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
  const locale = useLocale();
  const { data: branchList = [] } = useAdminBranchesQuery();
  const { data: facultyList = [] } = useAdminFacultiesQuery();
  const { data: departmentList = [] } = useAdminDepartmentsQuery();

  const branchOptions = branchList.map((branch) => ({
    value: String(branch.id),
    label:
      locale === "ar"
        ? branch.name_ar || branch.name_en || String(branch.id)
        : branch.name_en || branch.name_ar || String(branch.id),
  }));

  const facultyOptions = facultyList.map((faculty) => ({
    value: String(faculty.id),
    label:
      locale === "ar"
        ? faculty.name_ar || faculty.name_en || String(faculty.id)
        : faculty.name_en || faculty.name_ar || String(faculty.id),
  }));

  const [title, setTitle] = useState(program?.title ?? "");
  const [facultyId, setFacultyId] = useState(
    program?.facultyId ? String(program.facultyId) : ""
  );
  const [departmentId, setDepartmentId] = useState(
    program?.departmentId ? String(program.departmentId) : ""
  );
  const [duration, setDuration] = useState(program?.duration ?? "4 years");
  const [minimumRate, setMinimumRate] = useState(program?.minimumRate ?? 70);
  const [capacity, setCapacity] = useState(program?.capacity ?? 100);
  const [status, setStatus] = useState<AdminProgramStatus>(
    program?.status ?? "active"
  );
  const [branches, setBranches] = useState<string[]>(
    (program?.branches as unknown as string[]) ?? []
  );

  const departmentOptions = departmentList
    .filter(
      (department) =>
        !facultyId || String(department.faculty_id) === String(facultyId)
    )
    .map((department) => ({
      value: String(department.id),
      label:
        locale === "ar"
          ? department.name_ar || department.name_en || String(department.id)
          : department.name_en || department.name_ar || String(department.id),
    }));

  useEffect(() => {
    if (
      mode === "edit" &&
      program?.departmentId &&
      !facultyId &&
      departmentList.length > 0
    ) {
      const department = departmentList.find(
        (item) => String(item.id) === String(program.departmentId)
      );
      if (department?.faculty_id) {
        // One-time pre-fill of the cascading faculty select from the program's
        // department once the reference data has loaded.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFacultyId(String(department.faculty_id));
      }
    }
  }, [mode, program, facultyId, departmentList]);

  function handleFacultyChange(value: string) {
    setFacultyId(value);
    if (departmentId) {
      const department = departmentList.find(
        (item) => String(item.id) === String(departmentId)
      );
      if (department && String(department.faculty_id) !== String(value)) {
        setDepartmentId("");
      }
    }
  }

  function toggleBranch(branch: string) {
    setBranches((current) => {
      if (current.includes(branch)) {
        return current.filter((item) => item !== branch);
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
      faculty: facultyOptions.find((item) => item.value === facultyId)?.label ?? "",
      degree: "Bachelor",
      duration,
      status,
      minimumRate,
      capacity,
      applicationsCount: program?.applicationsCount ?? 0,
      acceptedCount: program?.acceptedCount ?? 0,
      branches: branches as unknown as AcademicBranch[],
      departmentId,
      facultyId,
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
              <SelectField
                required
                value={facultyId}
                onChange={handleFacultyChange}
                options={facultyOptions}
                placeholder={t("programs.form.selectFaculty")}
                disabled={facultyList.length === 0}
                emptyLabel={t("programs.form.selectFaculty")}
              />
            </FormField>

            <FormField label={t("programs.form.department")}>
              <SelectField
                required
                value={departmentId}
                onChange={setDepartmentId}
                options={departmentOptions}
                placeholder={t("programs.form.selectDepartment")}
                disabled={!facultyId || departmentList.length === 0}
                emptyLabel={
                  facultyId
                    ? t("programs.form.noDepartments")
                    : t("programs.form.selectFacultyFirst")
                }
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
                  key={branch.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-bold text-foreground transition hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={branches.includes(branch.value)}
                    onChange={() => toggleBranch(branch.value)}
                    className="size-4 rounded border-input text-primary focus:ring-primary"
                  />
                  {branch.label}
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

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  required?: boolean;
};

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  emptyLabel,
  disabled,
  required,
}: SelectFieldProps) {
  const defaultLabel = disabled ? (emptyLabel ?? placeholder ?? "") : (placeholder ?? "");
  const hasOptions = options.length > 0;

  return (
    <select
      required={required}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <option value="" disabled={hasOptions}>
        {defaultLabel}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
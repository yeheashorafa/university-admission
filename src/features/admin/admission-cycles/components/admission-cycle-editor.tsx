"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  CalendarClock,
  Lock,
  Save,
  Trash2,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AdmissionCycle,
  AdmissionCycleStatus,
} from "../data/admission-cycles.data";

type AdmissionCycleEditorProps = {
  cycle: AdmissionCycle;
  onUpdateCycle: (
    cycleId: string,
    updates: Partial<AdmissionCycle>,
    successMessage: string
  ) => void;
  onChangeStatus: (cycleId: string, status: AdmissionCycleStatus) => void;
  onDeleteCycle: (cycleId: string) => void;
};

const statusConfig: Record<
  AdmissionCycleStatus,
  {
    labelKey: string;
    className: string;
  }
> = {
  open: {
    labelKey: "admissionCycles.status.open",
    className: "bg-primary/10 text-primary",
  },
  upcoming: {
    labelKey: "admissionCycles.status.upcoming",
    className: "bg-secondary/10 text-secondary",
  },
  closed: {
    labelKey: "admissionCycles.status.closed",
    className: "bg-destructive/10 text-destructive",
  },
  archived: {
    labelKey: "admissionCycles.status.archived",
    className: "bg-muted text-muted-foreground",
  },
};

export function AdmissionCycleEditor({
  cycle,
  onUpdateCycle,
  onChangeStatus,
  onDeleteCycle,
}: AdmissionCycleEditorProps) {
  return (
    <AdmissionCycleEditorContent
      key={cycle.id}
      cycle={cycle}
      onUpdateCycle={onUpdateCycle}
      onChangeStatus={onChangeStatus}
      onDeleteCycle={onDeleteCycle}
    />
  );
}

function AdmissionCycleEditorContent({
  cycle,
  onUpdateCycle,
  onChangeStatus,
  onDeleteCycle,
}: AdmissionCycleEditorProps) {
  const t = useTranslations("admin");

  const [name, setName] = useState(cycle.name);
  const [academicYear, setAcademicYear] = useState(cycle.academicYear);
  const [semester, setSemester] = useState(cycle.semester);
  const [applicationsOpenAt, setApplicationsOpenAt] = useState(
    cycle.applicationsOpenAt
  );
  const [applicationsCloseAt, setApplicationsCloseAt] = useState(
    cycle.applicationsCloseAt
  );
  const [paymentDeadline, setPaymentDeadline] = useState(cycle.paymentDeadline);
  const [capacity, setCapacity] = useState(String(cycle.capacity));
  const [notes, setNotes] = useState(cycle.notes);

  const status = statusConfig[cycle.status];

  function handleSave() {
    onUpdateCycle(
      cycle.id,
      {
        name,
        academicYear,
        semester,
        applicationsOpenAt,
        applicationsCloseAt,
        paymentDeadline,
        capacity: Number(capacity),
        notes,
      },
      t("admissionCycles.savedSuccessfully")
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  status.className
                )}
              >
                {t(status.labelKey)}
              </span>

              <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                {cycle.academicYear}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-primary">
              {t("admissionCycles.cycleConfiguration")}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {t("admissionCycles.cycleConfigurationDescription")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <CycleActionButton
              icon={Unlock}
              label={t("admissionCycles.openCycle")}
              onClick={() => onChangeStatus(cycle.id, "open")}
            />

            <CycleActionButton
              icon={Lock}
              label={t("admissionCycles.closeCycle")}
              onClick={() => onChangeStatus(cycle.id, "closed")}
            />

            <CycleActionButton
              icon={Archive}
              label={t("admissionCycles.archive")}
              onClick={() => onChangeStatus(cycle.id, "archived")}
            />

            <CycleActionButton
              icon={Trash2}
              label={t("admissionCycles.delete")}
              onClick={() => onDeleteCycle(cycle.id)}
              className="text-destructive hover:bg-destructive/10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <CycleInput
            label={t("admissionCycles.cycleName")}
            value={name}
            onChange={setName}
          />

          <CycleInput
            label={t("admissionCycles.academicYear")}
            value={academicYear}
            onChange={setAcademicYear}
          />

          <div>
            <label
              htmlFor="semester"
              className="mb-2 block text-sm font-medium text-muted-foreground"
            >
              {t("admissionCycles.semester")}
            </label>

            <select
              id="semester"
              value={semester}
              onChange={(event) => setSemester(event.target.value)}
              className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="Fall">{t("admissionCycles.semesters.Fall")}</option>
              <option value="Spring">
                {t("admissionCycles.semesters.Spring")}
              </option>
              <option value="Summer">
                {t("admissionCycles.semesters.Summer")}
              </option>
            </select>
          </div>

          <CycleInput
            label={t("admissionCycles.totalCapacity")}
            type="number"
            value={capacity}
            onChange={setCapacity}
          />

          <CycleInput
            label={t("admissionCycles.applicationsOpenDate")}
            type="date"
            value={applicationsOpenAt}
            onChange={setApplicationsOpenAt}
          />

          <CycleInput
            label={t("admissionCycles.applicationsCloseDate")}
            type="date"
            value={applicationsCloseAt}
            onChange={setApplicationsCloseAt}
          />

          <CycleInput
            label={t("admissionCycles.paymentDeadline")}
            type="date"
            value={paymentDeadline}
            onChange={setPaymentDeadline}
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("admissionCycles.internalNotes")}
          </label>

          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-[120px] w-full rounded-lg border border-input bg-card p-4 text-base leading-7 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricBox
            label={t("admissionCycles.applications")}
            value={cycle.applicationsCount}
          />

          <MetricBox
            label={t("admissionCycles.accepted")}
            value={cycle.acceptedCount}
          />

          <MetricBox
            label={t("admissionCycles.remainingSeats")}
            value={Math.max(Number(capacity) - cycle.acceptedCount, 0)}
          />
        </div>

        <div className="rounded-lg border border-secondary/20 bg-secondary/10 p-5">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-1 size-5 shrink-0 text-secondary" />

            <div>
              <p className="font-bold text-foreground">
                {t("admissionCycles.cycleRule")}
              </p>

              <p className="mt-2 leading-7 text-muted-foreground">
                {t("admissionCycles.cycleRuleDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-border bg-muted p-5 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {t("admissionCycles.savingWarning")}
        </p>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Save className="size-5" />
          {t("admissionCycles.saveCycle")}
        </button>
      </div>
    </section>
  );
}

type CycleInputProps = {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
};

function CycleInput({
  label,
  value,
  type = "text",
  onChange,
}: CycleInputProps) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

type MetricBoxProps = {
  label: string;
  value: number;
};

function MetricBox({ label, value }: MetricBoxProps) {
  return (
    <div className="rounded-lg border border-border bg-muted p-4">
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

type CycleActionButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  className?: string;
};

function CycleActionButton({
  icon: Icon,
  label,
  onClick,
  className,
}: CycleActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground transition hover:bg-muted",
        className
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
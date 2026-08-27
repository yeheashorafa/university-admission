"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type { AdminAdmissionCyclePayload } from "@/services/admin.service";

type AdmissionCycleCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminAdmissionCyclePayload) => Promise<void>;
};

const SEMESTER_OPTIONS: { value: AdminAdmissionCyclePayload["semester"]; label: string }[] = [
  { value: "first", label: "First" },
  { value: "second", label: "Second" },
  { value: "summer", label: "Summer" },
];

export function AdmissionCycleCreateModal({
  open,
  onClose,
  onSubmit,
}: AdmissionCycleCreateModalProps) {
  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState<AdminAdmissionCyclePayload["semester"]>("first");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        academic_year: academicYear,
        semester,
        starts_at: startsAt,
        ends_at: endsAt,
        is_active: isActive,
      });
      setName("");
      setAcademicYear("");
      setSemester("first");
      setStartsAt("");
      setEndsAt("");
      setIsActive(true);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">New Admission Cycle</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted-foreground">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-card px-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted-foreground">
                Academic Year
              </span>
              <input
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026-2027"
                className="h-11 w-full rounded-lg border border-input bg-card px-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted-foreground">
                Semester
              </span>
              <select
                value={semester}
                onChange={(e) =>
                  setSemester(e.target.value as AdminAdmissionCyclePayload["semester"])
                }
                className="h-11 w-full rounded-lg border border-input bg-card px-3 outline-none focus:border-primary"
              >
                {SEMESTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted-foreground">
                Starts At
              </span>
              <input
                required
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-card px-3 outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-muted-foreground">
                Ends At
              </span>
              <input
                required
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-card px-3 outline-none focus:border-primary"
              />
            </label>

            <label className="flex items-center gap-2 pt-6 text-sm font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-border px-4 text-sm font-semibold transition hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

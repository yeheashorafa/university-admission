"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { GraduationCap, Loader2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { FormSkeleton } from "@/components/common/loading/form-skeleton";
import {
  useMySecondarySchoolRecordQuery,
  useUpdateSecondarySchoolRecordMutation,
} from "@/hooks/queries/use-student-secondary-school-records";
import { extractApiError } from "@/lib/api/api-error";
import type { UpdateSecondarySchoolRecordPayload } from "@/services/student-secondary-school-records.service";

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 15 }, (_, i) =>
  String(CURRENT_YEAR - i)
);

export function SecondarySchoolRecordForm() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: record, isLoading } = useMySecondarySchoolRecordQuery();
  const mutation = useUpdateSecondarySchoolRecordMutation();

  const [form, setForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const value = (key: string, fallback = "") => form[key] ?? record?.[key as keyof typeof record] ?? fallback;

  function updateField(key: string, val: string) {
    setForm((current) => ({ ...current, [key]: val }));
    if (formError) setFormError(null);
  }

  async function handleSave() {
    setFormError(null);

    const graduationYear = Number(value("graduation_year"));
    const average = Number(value("average"));

    if (!value("student_school_id").trim()) {
      const msg = isAr ? "رقم المدرسة مطلوب" : "School ID is required";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!graduationYear || graduationYear < 1990 || graduationYear > CURRENT_YEAR) {
      const msg = isAr
        ? `سنة التخرج يجب أن تكون بين 1990 و ${CURRENT_YEAR}`
        : `Graduation year must be between 1990 and ${CURRENT_YEAR}`;
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (Number.isNaN(average) || average < 0 || average > 100) {
      const msg = isAr ? "المعدل يجب أن يكون بين 0 و 100" : "Average must be between 0 and 100";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    const payload: UpdateSecondarySchoolRecordPayload = {
      student_school_id: value("student_school_id").trim(),
      graduation_year: graduationYear,
      average,
      branch: value("branch").trim() || null,
      seat_number: value("seat_number").trim() || null,
      total_marks: value("total_marks").trim() ? Number(value("total_marks")) : null,
      certificate_type: value("certificate_type").trim() || null,
    };

    try {
      await mutation.mutateAsync(payload);
      toast.success(isAr ? "تم حفظ سجل الثانوية العامة بنجاح" : "Secondary school record saved");
    } catch (err) {
      const apiError = extractApiError(err);
      setFormError(apiError.message);
      toast.error(apiError.message);
    }
  }

  if (isLoading) {
    return <FormSkeleton fields={5} />;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
          <GraduationCap className="size-6 text-secondary" />
          {t("secondarySchoolRecord")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("secondarySchoolRecordDescription")}
        </p>
      </div>

      {formError && (
        <div className="mb-6 flex items-center gap-3 rounded-[18px] border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="school-id"
          label={t("schoolId")}
          value={value("student_school_id")}
          onChange={(v) => updateField("student_school_id", v)}
        />
        <div>
          <label htmlFor="graduation-year" className="mb-2 block text-sm font-medium text-muted-foreground">
            {t("graduationYear")} *
          </label>
          <select
            id="graduation-year"
            value={value("graduation_year")}
            onChange={(e) => updateField("graduation_year", e.target.value)}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">{t("selectYear")}</option>
            {GRADUATION_YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <Field
          id="average"
          label={`${t("average")} *`}
          type="number"
          value={value("average")}
          onChange={(v) => updateField("average", v)}
        />
        <Field
          id="branch"
          label={`${t("branch")} (${isAr ? "اختياري" : "Optional"})`}
          value={value("branch")}
          onChange={(v) => updateField("branch", v)}
        />
        <Field
          id="seat-number"
          label={`${t("seatNumber")} (${isAr ? "اختياري" : "Optional"})`}
          value={value("seat_number")}
          onChange={(v) => updateField("seat_number", v)}
        />
        <Field
          id="total-marks"
          label={`${t("totalMarks")} (${isAr ? "اختياري" : "Optional"})`}
          type="number"
          value={value("total_marks")}
          onChange={(v) => updateField("total_marks", v)}
        />
        <Field
          id="certificate-type"
          label={`${t("certificateType")} (${isAr ? "اختياري" : "Optional"})`}
          value={value("certificate_type")}
          onChange={(v) => updateField("certificate_type", v)}
        />
      </div>

      <div className="mt-8 flex justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={mutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {mutation.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          {t("saveSecondarySchoolRecord")}
        </button>
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
};

function Field({ id, label, value, type = "text", onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

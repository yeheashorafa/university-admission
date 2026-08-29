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
import { extractApiError, isVerificationError } from "@/lib/api/api-error";
import type { UpdateSecondarySchoolRecordPayload } from "@/services/student-secondary-school-records.service";
import Link from "next/link";

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 15 }, (_, i) =>
  String(CURRENT_YEAR - i)
);

export function SecondarySchoolRecordForm() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: record, isLoading, isError, error, refetch, isFetching } = useMySecondarySchoolRecordQuery();
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

    if (!record?.id) {
      const msg = isAr
        ? "تعذر تحديد سجل الثانوية العامة"
        : "Could not resolve the secondary school record id";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    const payload: UpdateSecondarySchoolRecordPayload = {
      student_school_id: value("student_school_id").trim(),
      graduation_year: graduationYear,
      average,
    };

    try {
      await mutation.mutateAsync({ id: record.id, payload });
      toast.success(isAr ? "تم حفظ سجل الثانوية العامة بنجاح" : "Secondary school record saved");
    } catch (err) {
      const apiError = extractApiError(err);
      setFormError(apiError.message);
      toast.error(apiError.message);
    }
  }

  if (isLoading || isFetching) {
    return <FormSkeleton fields={5} />;
  }

  if (isError) {
    const apiError = extractApiError(error);
    const isVerifyError = isVerificationError(error);

    if (isVerifyError) {
      return (
        <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] text-center">
           <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
           <p className="mb-4 text-muted-foreground">
             {isAr ? "يرجى تفعيل حسابك لعرض بيانات الثانوية العامة." : "Please verify your account to view secondary school records."}
           </p>
           <Link
             href={`/${locale}/verify-otp?reason=verification`}
             className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
           >
             {isAr ? "تفعيل الحساب" : "Verify Account"}
           </Link>
        </section>
      );
    }

    if (apiError.status === 404) {
      return (
        <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
           <div className="mb-6 border-b border-border pb-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
              <GraduationCap className="size-6 text-secondary" />
              {t("secondarySchoolRecord")}
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">
              {isAr ? "لا توجد سجلات ثانوية عامة متاحة." : "No record available."}
            </p>
          </div>
        </section>
      );
    }

    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <p className="mb-4 text-muted-foreground">
          {isAr ? "تعذر تحميل سجل الثانوية العامة." : "Unable to load secondary school record."}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          {isAr ? "إعادة المحاولة" : "Retry"}
        </button>
      </section>
    );
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

"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { Info, RotateCcw, CheckCircle2 } from "lucide-react";
import type { QualificationData } from "../../types/application-form.types";
import {
  QUALIFICATION_TYPES,
  DESIRED_STUDY_LEVELS,
  QUALIFICATION_TO_STUDY_LEVELS,
} from "../../constants/qualification.constants";

type QualificationDataStepProps = {
  data: QualificationData;
  onChange: (updated: Partial<QualificationData>) => void;
  onConfirm: () => void;
  onReset: () => void;
};

export function QualificationDataStep({
  data,
  onChange,
  onConfirm,
  onReset,
}: QualificationDataStepProps) {
  const locale = useLocale();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLocked = Boolean(data.lockedQualificationFields);

  const years = Array.from({ length: 25 }, (_, i) => String(2026 - i));

  // Determine allowed study levels based on qualification_type
  const allowedStudyLevelIds =
    QUALIFICATION_TO_STUDY_LEVELS[data.qualification_type]?.allowed || [
      "bachelor",
    ];
  const allowedStudyLevels = DESIRED_STUDY_LEVELS.filter((l) =>
    allowedStudyLevelIds.includes(l.id)
  );

  const handleQualificationTypeChange = (newType: string) => {
    const mapping = QUALIFICATION_TO_STUDY_LEVELS[newType];
    const allowed = mapping?.allowed || ["bachelor"];
    let newDesiredLevel = data.desired_study_level;

    if (!allowed.includes(newDesiredLevel)) {
      newDesiredLevel = mapping?.default || allowed[0] || "bachelor";
    }

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.qualification_type;
      delete copy.desired_study_level;
      return copy;
    });

    onChange({
      qualification_type: newType,
      desired_study_level: newDesiredLevel,
    });
  };

  const handleVerificationMethodChange = (
    method: "seat_number" | "national_id"
  ) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.verification_method;
      delete copy.identifier;
      return copy;
    });

    if (method === "national_id") {
      onChange({
        verification_method: method,
        seat_number: "",
      });
    } else {
      onChange({
        verification_method: method,
        national_id: "",
      });
    }
  };

  const handleResultCheckMethodChange = (
    method: "percentage" | "total_score"
  ) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.result_check_method;
      delete copy.result_value;
      return copy;
    });

    if (method === "total_score") {
      onChange({
        result_check_method: method,
        tawjihi_percentage: undefined,
      });
    } else {
      onChange({
        result_check_method: method,
        tawjihi_total_score: undefined,
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.qualification_type) {
      newErrors.qualification_type =
        locale === "ar" ? "نوع القبول مطلوب" : "Qualification type is required";
    }

    if (!data.desired_study_level) {
      newErrors.desired_study_level =
        locale === "ar"
          ? "برنامج الدراسة مطلوب"
          : "Desired study program is required";
    }

    if (!data.qualification_year) {
      newErrors.qualification_year =
        locale === "ar"
          ? "سنة الدراسة/التوجيهي مطلوبة"
          : "Qualification year is required";
    }

    if (!data.verification_method) {
      newErrors.verification_method =
        locale === "ar"
          ? "طريقة التحقق مطلوبة"
          : "Verification method is required";
    }

    if (data.verification_method === "seat_number") {
      if (!data.seat_number || !data.seat_number.trim()) {
        newErrors.identifier =
          locale === "ar" ? "رقم الجلوس مطلوب" : "Seat number is required";
      }
    } else if (data.verification_method === "national_id") {
      if (!data.national_id || !data.national_id.trim()) {
        newErrors.identifier =
          locale === "ar" ? "رقم الهوية مطلوب" : "National ID is required";
      } else if (data.national_id.trim().length !== 9) {
        newErrors.identifier =
          locale === "ar"
            ? "يجب أن يتكون رقم الهوية من 9 أرقام"
            : "National ID must be 9 digits";
      }
    }

    if (!data.result_check_method) {
      newErrors.result_check_method =
        locale === "ar"
          ? "طريقة فحص النتيجة مطلوبة"
          : "Result check method is required";
    }

    if (data.result_check_method === "percentage") {
      if (
        data.tawjihi_percentage === undefined ||
        isNaN(data.tawjihi_percentage)
      ) {
        newErrors.result_value =
          locale === "ar" ? "نسبة توجيهي مطلوبة" : "Percentage is required";
      } else if (
        data.tawjihi_percentage < 0 ||
        data.tawjihi_percentage > 100
      ) {
        newErrors.result_value =
          locale === "ar"
            ? "نسبة التوجيهي يجب أن تكون بين 0 و 100"
            : "Percentage must be between 0 and 100";
      }
    } else if (data.result_check_method === "total_score") {
      if (
        data.tawjihi_total_score === undefined ||
        isNaN(data.tawjihi_total_score)
      ) {
        newErrors.result_value =
          locale === "ar"
            ? "مجموع علامات التوجيهي مطلوب"
            : "Total score is required";
      } else if (data.tawjihi_total_score <= 0) {
        newErrors.result_value =
          locale === "ar"
            ? "مجموع درجات التوجيهي يجب أن يكون أكثر من 0"
            : "Total score must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmClick = () => {
    if (validate()) {
      onConfirm();
    }
  };

  const handleResetClick = () => {
    setErrors({});
    onReset();
  };

  return (
    <div className="space-y-8">
      {/* Header & Title */}
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar"
            ? "1. بيانات التوجيهي والمؤهل"
            : "1. Qualification & Admission Data"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "تعبئة بيانات المؤهل الدراسي ورقم التحقق الخاص بالقبول."
            : "Enter your admission qualification details and verification number."}
        </p>
      </div>

      {/* Integration Note */}
      {data.verificationSource === "pending_backend_api" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 p-4 text-xs font-semibold text-amber-800 dark:text-amber-300 shadow-sm">
          <Info className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <span>
            {locale === "ar"
              ? "سيتم التحقق من هذه البيانات لاحقاً من مصادر وزارة التربية والتعليم عند توفر الربط."
              : "These details will be verified later through the Ministry/Education integration when available."}
          </span>
        </div>
      )}

      {/* Main Fields Form Card */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* A. Qualification Type */}
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-foreground block">
              {locale === "ar"
                ? "نوع القبول (آخر شهادة حصلت عليها) *"
                : "Qualification Type (Last Degree Obtained) *"}
            </label>
            <select
              value={data.qualification_type}
              disabled={isLocked}
              onChange={(e) => handleQualificationTypeChange(e.target.value)}
              className={`w-full h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:ring-1 ${
                errors.qualification_type
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-input focus:border-primary focus:ring-primary"
              }`}
            >
              {QUALIFICATION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {locale === "ar" ? t.labelAr : t.labelEn}
                </option>
              ))}
            </select>
            {errors.qualification_type && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.qualification_type}
              </p>
            )}
          </div>

          {/* B. Desired Study Level */}
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-foreground block">
              {locale === "ar"
                ? "برنامج الدراسة الذي ترغب الالتحاق به *"
                : "Desired Study Level *"}
            </label>
            <select
              value={data.desired_study_level}
              disabled={isLocked}
              onChange={(e) => {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.desired_study_level;
                  return copy;
                });
                onChange({ desired_study_level: e.target.value });
              }}
              className={`w-full h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:ring-1 ${
                errors.desired_study_level
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-input focus:border-primary focus:ring-primary"
              }`}
            >
              {allowedStudyLevels.map((l) => (
                <option key={l.id} value={l.id}>
                  {locale === "ar" ? l.labelAr : l.labelEn}
                </option>
              ))}
            </select>
            {errors.desired_study_level && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.desired_study_level}
              </p>
            )}
          </div>

          {/* C. Qualification Year */}
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-foreground block">
              {locale === "ar"
                ? "سنة الدراسة/التوجيهي *"
                : "Study / Tawjihi Year *"}
            </label>
            <select
              value={data.qualification_year}
              disabled={isLocked}
              onChange={(e) => {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.qualification_year;
                  return copy;
                });
                onChange({ qualification_year: e.target.value });
              }}
              className={`w-full h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:ring-1 ${
                errors.qualification_year
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-input focus:border-primary focus:ring-primary"
              }`}
            >
              <option value="">
                {locale === "ar" ? "اختر السنة" : "Select Year"}
              </option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            {errors.qualification_year && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.qualification_year}
              </p>
            )}
          </div>

          {/* D. Verification Method Radios */}
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-foreground block">
              {locale === "ar" ? "طريقة التحقق *" : "Verification Method *"}
            </label>
            <div className="flex items-center gap-6 h-11 px-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold">
                <input
                  type="radio"
                  name="verification_method"
                  value="seat_number"
                  checked={data.verification_method === "seat_number"}
                  disabled={isLocked}
                  onChange={() =>
                    handleVerificationMethodChange("seat_number")
                  }
                  className="size-4 text-primary focus:ring-primary accent-primary"
                />
                <span>{locale === "ar" ? "رقم الجلوس" : "Seat Number"}</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold">
                <input
                  type="radio"
                  name="verification_method"
                  value="national_id"
                  checked={data.verification_method === "national_id"}
                  disabled={isLocked}
                  onChange={() => handleVerificationMethodChange("national_id")}
                  className="size-4 text-primary focus:ring-primary accent-primary"
                />
                <span>{locale === "ar" ? "رقم الهوية" : "National ID"}</span>
              </label>
            </div>
            {errors.verification_method && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.verification_method}
              </p>
            )}
          </div>

          {/* E. Dynamic Identifier Input */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-bold text-foreground block">
              {data.verification_method === "seat_number"
                ? locale === "ar"
                  ? "رقم الجلوس *"
                  : "Seat Number *"
                : locale === "ar"
                ? "رقم الهوية *"
                : "National ID *"}
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={
                data.verification_method === "seat_number"
                  ? data.seat_number || ""
                  : data.national_id || ""
              }
              onChange={(e) => {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.identifier;
                  return copy;
                });
                if (data.verification_method === "seat_number") {
                  onChange({ seat_number: e.target.value.replace(/\D/g, "") });
                } else {
                  onChange({
                    national_id: e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 9),
                  });
                }
              }}
              placeholder={
                data.verification_method === "seat_number"
                  ? locale === "ar"
                    ? "أدخل رقم الجلوس الخاص بالتوجيهي"
                    : "Enter high school seat number"
                  : locale === "ar"
                  ? "أدخل رقم الهوية الوطنية المكون من 9 أرقام"
                  : "Enter 9-digit national ID"
              }
              maxLength={data.verification_method === "national_id" ? 9 : 20}
              className={`w-full h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:ring-1 ${
                errors.identifier
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-input focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.identifier && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* F. Result Check Method Radios */}
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-foreground block">
              {locale === "ar"
                ? "طريقة فحص النتيجة *"
                : "Result Check Method *"}
            </label>
            <div className="flex items-center gap-6 h-11 px-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold">
                <input
                  type="radio"
                  name="result_check_method"
                  value="percentage"
                  checked={data.result_check_method === "percentage"}
                  disabled={isLocked}
                  onChange={() => handleResultCheckMethodChange("percentage")}
                  className="size-4 text-primary focus:ring-primary accent-primary"
                />
                <span>
                  {locale === "ar" ? "نسبة التوجيهي" : "Tawjihi Percentage"}
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold">
                <input
                  type="radio"
                  name="result_check_method"
                  value="total_score"
                  checked={data.result_check_method === "total_score"}
                  disabled={isLocked}
                  onChange={() => handleResultCheckMethodChange("total_score")}
                  className="size-4 text-primary focus:ring-primary accent-primary"
                />
                <span>
                  {locale === "ar"
                    ? "مجموع درجات توجيهي"
                    : "Tawjihi Total Score"}
                </span>
              </label>
            </div>
            {errors.result_check_method && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.result_check_method}
              </p>
            )}
          </div>

          {/* G. Dynamic Result Input */}
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-bold text-foreground block">
              {data.result_check_method === "percentage"
                ? locale === "ar"
                  ? "نسبة توجيهي % *"
                  : "Tawjihi Percentage % *"
                : locale === "ar"
                ? "مجموع علامات التوجيهي *"
                : "Tawjihi Total Score *"}
            </label>
            <input
              type="text"
              disabled={isLocked}
              value={
                data.result_check_method === "percentage"
                  ? data.tawjihi_percentage !== undefined
                    ? String(data.tawjihi_percentage)
                    : ""
                  : data.tawjihi_total_score !== undefined
                  ? String(data.tawjihi_total_score)
                  : ""
              }
              onChange={(e) => {
                setErrors((prev) => {
                  const copy = { ...prev };
                  delete copy.result_value;
                  return copy;
                });
                const val = e.target.value.replace(/[^0-9.]/g, "");
                const num = val === "" ? undefined : parseFloat(val);

                if (data.result_check_method === "percentage") {
                  onChange({ tawjihi_percentage: num });
                } else {
                  onChange({ tawjihi_total_score: num });
                }
              }}
              placeholder={
                data.result_check_method === "percentage"
                  ? "85.4"
                  : locale === "ar"
                  ? "مثال: 750"
                  : "Example: 750"
              }
              className={`w-full h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:ring-1 ${
                errors.result_value
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-input focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.result_value && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.result_value}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons inside Card */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={handleResetClick}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-5 text-sm font-bold text-foreground hover:bg-muted transition active:scale-95"
          >
            <RotateCcw className="size-4" />
            {locale === "ar" ? "إعادة تعيين" : "Reset"}
          </button>

          <button
            type="button"
            onClick={handleConfirmClick}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-md hover:bg-primary/95 transition active:scale-95"
          >
            <CheckCircle2 className="size-4" />
            {locale === "ar" ? "موافق وتأكيد" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

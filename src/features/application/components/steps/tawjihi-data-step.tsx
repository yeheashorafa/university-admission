"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import type { TawjihiData } from "../../types/application-form.types";

type TawjihiDataStepProps = {
  data: TawjihiData;
  onChange: (updated: Partial<TawjihiData>) => void;
};

export function TawjihiDataStep({ data, onChange }: TawjihiDataStepProps) {
  const locale = useLocale();
  const [error, setError] = useState<string | null>(null);

  const certTypes = [
    { id: "tawjihi", labelAr: "ثانوية عامة فلسطينية (توجيهي)", labelEn: "Palestinian General Secondary (Tawjihi)" },
    { id: "other", labelAr: "أخرى", labelEn: "Other Equivalent" },
  ];

  const branches = [
    { id: "scientific", labelAr: "علمي", labelEn: "Scientific" },
    { id: "literary", labelAr: "أدبي", labelEn: "Literary" },
    { id: "industrial", labelAr: "صناعي", labelEn: "Industrial" },
    { id: "commercial", labelAr: "ريادة وأعمال", labelEn: "Entrepreneurship & Business" },
    { id: "sharia", labelAr: "شرعي", labelEn: "Sharia" },
  ];

  const studyYears = ["2026", "2025", "2024", "2023", "2022", "2021"];

  const handlePercentageChange = (val: string) => {
    // Only numeric and dot allowed
    const sanitized = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(sanitized);

    if (parsed > 100) {
      setError(locale === "ar" ? "النسبة المئوية لا يمكن أن تتجاوز 100%" : "Percentage cannot exceed 100%");
    } else {
      setError(null);
    }
    onChange({ percentage: sanitized });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar" ? "2. البيانات الرئيسية والثانوية العامة" : "2. Main & Tawjihi Academic Data"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "يرجى تعبئة معدلك الدراسي ورقم الجلوس الخاص بالثانوية العامة."
            : "Please fill in your high school score, GPA percentage, and seat number."}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "آخر شهادة حصلت عليها *" : "Last Certificate Obtained *"}
          </label>
          <select
            value={data.lastCertificate}
            onChange={(e) => onChange({ lastCertificate: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            {certTypes.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === "ar" ? c.labelAr : c.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "فرع الدراسة / البرنامج *" : "Academic Branch *"}
          </label>
          <select
            value={data.studyProgram}
            onChange={(e) => onChange({ studyProgram: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">{locale === "ar" ? "اختر فرع الدراسة" : "Select Branch"}</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {locale === "ar" ? b.labelAr : b.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "سنة الحصول على الشهادة *" : "Graduation Year *"}
          </label>
          <select
            value={data.studyYear}
            onChange={(e) => onChange({ studyYear: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">{locale === "ar" ? "اختر السنة" : "Select Year"}</option>
            {studyYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "رقم الجلوس *" : "Seat Number *"}
          </label>
          <input
            type="text"
            value={data.seatNumber}
            onChange={(e) => onChange({ seatNumber: e.target.value.replace(/\D/g, "") })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder={locale === "ar" ? "أدخل رقم الجلوس" : "Enter seat number"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "مجموع العلامات *" : "Total Marks *"}
          </label>
          <input
            type="text"
            value={data.totalMarks}
            onChange={(e) => onChange({ totalMarks: e.target.value.replace(/[^0-9.]/g, "") })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder={locale === "ar" ? "مثال: 750" : "Example: 750"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "النسبة المئوية % *" : "Percentage % *"}
          </label>
          <input
            type="text"
            value={data.percentage}
            onChange={(e) => handlePercentageChange(e.target.value)}
            className={`w-full h-11 rounded-xl border bg-card px-3 text-sm outline-none transition focus:ring-1 ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-input focus:border-primary focus:ring-primary"
            }`}
            placeholder="85.4"
          />
          {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "رقم الهوية الوطنية *" : "National ID Number *"}
          </label>
          <input
            type="text"
            value={data.nationalId}
            onChange={(e) => onChange({ nationalId: e.target.value.replace(/\D/g, "").slice(0, 9) })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder={locale === "ar" ? "أدخل رقم الهوية المكون من 9 أرقام" : "Enter 9-digit ID number"}
            maxLength={9}
          />
        </div>
      </div>
    </div>
  );
}

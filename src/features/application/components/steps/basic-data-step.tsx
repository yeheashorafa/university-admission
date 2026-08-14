"use client";

import { useLocale } from "next-intl";
import type { BasicPersonalData } from "../../types/application-form.types";

type BasicDataStepProps = {
  data: BasicPersonalData;
  onChange: (updated: Partial<BasicPersonalData>) => void;
};

export function BasicDataStep({ data, onChange }: BasicDataStepProps) {
  const locale = useLocale();

  const handleEnglishInputOnly = (field: keyof BasicPersonalData, val: string) => {
    // Keep only English alphabetic characters and spaces
    const sanitized = val.replace(/[^a-zA-Z\s]/g, "");
    onChange({ [field]: sanitized });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar" ? "3. البيانات الأساسية للطالب" : "3. Basic Personal Data"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "يرجى إدخال بياناتك الشخصية والاسم باللغة الإنجليزية كما هو في جواز السفر."
            : "Please fill in your basic personal information and your name in English as in passport."}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "مكان الميلاد *" : "Place of Birth *"}
          </label>
          <select
            value={data.birthPlace}
            onChange={(e) => onChange({ birthPlace: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">{locale === "ar" ? "اختر مكان الميلاد" : "Select Place of Birth"}</option>
            <option value="inside_palestine">{locale === "ar" ? "داخل فلسطين" : "Inside Palestine"}</option>
            <option value="outside_palestine">{locale === "ar" ? "خارج فلسطين" : "Outside Palestine"}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "دولة الميلاد *" : "Country of Birth *"}
          </label>
          <select
            value={data.birthCountry}
            onChange={(e) => onChange({ birthCountry: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="Palestine">{locale === "ar" ? "فلسطين" : "Palestine"}</option>
            <option value="Egypt">{locale === "ar" ? "مصر" : "Egypt"}</option>
            <option value="Jordan">{locale === "ar" ? "الأردن" : "Jordan"}</option>
            <option value="Saudi Arabia">{locale === "ar" ? "المملكة العربية السعودية" : "Saudi Arabia"}</option>
            <option value="UAE">{locale === "ar" ? "الإمارات العربية المتحدة" : "UAE"}</option>
            <option value="Other">{locale === "ar" ? "أخرى" : "Other"}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "تاريخ الميلاد *" : "Date of Birth *"}
          </label>
          <input
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange({ birthDate: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        <div className="hidden sm:block" />

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "الاسم الأول (بالإنجليزي) *" : "First Name (in English) *"}
          </label>
          <input
            type="text"
            value={data.firstNameEn}
            onChange={(e) => handleEnglishInputOnly("firstNameEn", e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Ahmed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "اسم الأب (بالإنجليزي) *" : "Father's Name (in English) *"}
          </label>
          <input
            type="text"
            value={data.fatherNameEn}
            onChange={(e) => handleEnglishInputOnly("fatherNameEn", e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Mohammad"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "اسم الجد (بالإنجليزي) *" : "Grandfather's Name (in English) *"}
          </label>
          <input
            type="text"
            value={data.grandfatherNameEn}
            onChange={(e) => handleEnglishInputOnly("grandfatherNameEn", e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Hassan"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "اسم العائلة / اللقب (بالإنجليزي) *" : "Family Name (in English) *"}
          </label>
          <input
            type="text"
            value={data.lastNameEn}
            onChange={(e) => handleEnglishInputOnly("lastNameEn", e.target.value)}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Masri"
          />
        </div>
      </div>
    </div>
  );
}

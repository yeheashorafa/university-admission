"use client";

import { useLocale } from "next-intl";
import type { GuardianData } from "../../types/application-form.types";

type GuardianDataStepProps = {
  data: GuardianData;
  onChange: (updated: Partial<GuardianData>) => void;
};

export function GuardianDataStep({ data, onChange }: GuardianDataStepProps) {
  const locale = useLocale();

  const relationships = [
    { id: "father", labelAr: "أب", labelEn: "Father" },
    { id: "mother", labelAr: "أم", labelEn: "Mother" },
    { id: "brother", labelAr: "أخ", labelEn: "Brother" },
    { id: "sister", labelAr: "أخت", labelEn: "Sister" },
    { id: "paternal_uncle", labelAr: "عم", labelEn: "Paternal Uncle" },
    { id: "maternal_uncle", labelAr: "خال", labelEn: "Maternal Uncle" },
    { id: "grandfather", labelAr: "جد", labelEn: "Grandfather" },
    { id: "other", labelAr: "آخر", labelEn: "Other" },
  ];

  const professions = [
    { id: "government_employee", labelAr: "موظف حكومي", labelEn: "Government Employee" },
    { id: "unrwa_employee", labelAr: "موظف وكالة (UNRWA)", labelEn: "UNRWA Employee" },
    { id: "private_sector", labelAr: "قطاع خاص", labelEn: "Private Sector" },
    { id: "merchant", labelAr: "تاجر", labelEn: "Merchant" },
    { id: "craftsman", labelAr: "حرفي", labelEn: "Craftsman" },
    { id: "teacher", labelAr: "معلم", labelEn: "Teacher" },
    { id: "military", labelAr: "عسكري", labelEn: "Military" },
    { id: "unemployed", labelAr: "عاطل عن العمل", labelEn: "Unemployed" },
    { id: "retired", labelAr: "متقاعد", labelEn: "Retired" },
    { id: "other", labelAr: "آخر", labelEn: "Other" },
  ];

  const workplaces = [
    { id: "ministry_of_health", labelAr: "وزارة الصحة", labelEn: "Ministry of Health" },
    { id: "ministry_of_education", labelAr: "وزارة التربية والتعليم", labelEn: "Ministry of Education" },
    { id: "ministry_of_interior", labelAr: "وزارة الداخلية", labelEn: "Ministry of Interior" },
    { id: "ministry_of_finance", labelAr: "وزارة المالية", labelEn: "Ministry of Finance" },
    { id: "ministry_of_social_affairs", labelAr: "وزارة التنمية الاجتماعية", labelEn: "Ministry of Social Affairs" },
    { id: "ministry_of_awqaf", labelAr: "وزارة الأوقاف", labelEn: "Ministry of Awqaf" },
    { id: "ministry_of_justice", labelAr: "وزارة العدل", labelEn: "Ministry of Justice" },
    { id: "ministry_of_public_works", labelAr: "وزارة الأشغال العامة", labelEn: "Ministry of Public Works" },
    { id: "ministry_of_agriculture", labelAr: "وزارة الزراعة", labelEn: "Ministry of Agriculture" },
    { id: "ministry_of_transportation", labelAr: "وزارة النقل والمواصلات", labelEn: "Ministry of Transportation" },
    { id: "unrwa", labelAr: "الأونروا (UNRWA)", labelEn: "UNRWA" },
    { id: "private_sector", labelAr: "القطاع الخاص", labelEn: "Private Sector" },
    { id: "ngo", labelAr: "مؤسسة أهلية / مجتمع مدني", labelEn: "NGO" },
    { id: "self_employed", labelAr: "عمل حر", labelEn: "Self Employed" },
    { id: "other", labelAr: "أخرى", labelEn: "Other" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar" ? "4. بيانات ولي الأمر" : "4. Guardian Data"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "يرجى إدخال بيانات ولي الأمر وتحديد الحالة الاجتماعية والعملية للوالدين."
            : "Please fill in your guardian details, along with parental status and work indicators."}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "صلة القرابة *" : "Relationship *"}
          </label>
          <select
            value={data.guardianRelationship}
            onChange={(e) => onChange({ guardianRelationship: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">{locale === "ar" ? "اختر صلة القرابة" : "Select Relation"}</option>
            {relationships.map((r) => (
              <option key={r.id} value={r.id}>
                {locale === "ar" ? r.labelAr : r.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "اسم ولي الأمر كاملاً *" : "Guardian Full Name *"}
          </label>
          <input
            type="text"
            value={data.guardianName}
            onChange={(e) => onChange({ guardianName: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder={locale === "ar" ? "أدخل الاسم رباعي" : "Enter guardian full name"}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "رقم هوية ولي الأمر *" : "Guardian ID Number *"}
          </label>
          <input
            type="text"
            value={data.guardianNationalId}
            onChange={(e) => onChange({ guardianNationalId: e.target.value.replace(/\D/g, "").slice(0, 9) })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder={locale === "ar" ? "أدخل 9 أرقام" : "Enter 9-digit ID"}
            maxLength={9}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "مهنة ولي الأمر *" : "Guardian Occupation *"}
          </label>
          <select
            value={data.guardianJob}
            onChange={(e) => onChange({ guardianJob: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">{locale === "ar" ? "اختر مهنة ولي الأمر" : "Select Occupation"}</option>
            {professions.map((p) => (
              <option key={p.id} value={p.id}>
                {locale === "ar" ? p.labelAr : p.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "جهة العمل / مكان العمل *" : "Guardian Workplace *"}
          </label>
          <select
            value={data.guardianWorkplace}
            onChange={(e) => onChange({ guardianWorkplace: e.target.value })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="">{locale === "ar" ? "اختر جهة العمل" : "Select Workplace"}</option>
            {workplaces.map((w) => (
              <option key={w.id} value={w.id}>
                {locale === "ar" ? w.labelAr : w.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "رقم جوال ولي الأمر *" : "Guardian Mobile Number *"}
          </label>
          <input
            type="text"
            value={data.guardianPhone}
            onChange={(e) => onChange({ guardianPhone: e.target.value.replace(/\D/g, "") })}
            className="w-full h-11 rounded-xl border border-input bg-card px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="059XXXXXXX"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "حالة الأب *" : "Father's Status *"}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="fatherStatus"
                checked={data.fatherStatus === "alive"}
                onChange={() => onChange({ fatherStatus: "alive" })}
                className="size-4 text-primary border-border focus:ring-primary"
              />
              {locale === "ar" ? "على قيد الحياة" : "Alive"}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="fatherStatus"
                checked={data.fatherStatus === "deceased"}
                onChange={() => onChange({ fatherStatus: "deceased" })}
                className="size-4 text-primary border-border focus:ring-primary"
              />
              {locale === "ar" ? "متوفى" : "Deceased"}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="fatherStatus"
                checked={data.fatherStatus === "abandoned"}
                onChange={() => onChange({ fatherStatus: "abandoned" })}
                className="size-4 text-primary border-border focus:ring-primary"
              />
              {locale === "ar" ? "مهجور" : "Abandoned"}
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "هل الأب يعمل؟ *" : "Does the Father Work? *"}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="fatherWorks"
                checked={data.fatherWorks === "yes"}
                onChange={() => onChange({ fatherWorks: "yes" })}
                className="size-4 text-primary border-border focus:ring-primary"
              />
              {locale === "ar" ? "نعم" : "Yes"}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="fatherWorks"
                checked={data.fatherWorks === "no"}
                onChange={() => onChange({ fatherWorks: "no" })}
                className="size-4 text-primary border-border focus:ring-primary"
              />
              {locale === "ar" ? "لا" : "No"}
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "هل الأم تعمل؟ *" : "Does the Mother Work? *"}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="motherWorks"
                checked={data.motherWorks === "yes"}
                onChange={() => onChange({ motherWorks: "yes" })}
                className="size-4 text-primary border-border focus:ring-primary"
              />
              {locale === "ar" ? "نعم" : "Yes"}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="radio"
                name="motherWorks"
                checked={data.motherWorks === "no"}
                onChange={() => onChange({ motherWorks: "no" })}
                className="size-4 text-primary border-border focus:ring-primary"
              />
              {locale === "ar" ? "لا" : "No"}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

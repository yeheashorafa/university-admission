"use client";

import { useLocale } from "next-intl";
import type { AdmissionTypeData } from "../../types/application-form.types";

type AdmissionTypeStepProps = {
  data: AdmissionTypeData;
  onChange: (updated: Partial<AdmissionTypeData>) => void;
};

export function AdmissionTypeStep({ data, onChange }: AdmissionTypeStepProps) {
  const locale = useLocale();

  const admissionTypes = [
    {
      id: "bachelor",
      titleAr: "درجة البكالوريوس",
      titleEn: "Bachelor Degree",
      descAr: "للطفال الناجحين في الثانوية العامة والراغبين بدراسة درجة البكالوريوس.",
      descEn: "For students who completed high school and want to pursue a Bachelor's degree.",
    },
    {
      id: "diploma",
      titleAr: "درجة الدبلوم المتوسط",
      titleEn: "Associate Diploma Degree",
      descAr: "دراسة مهنية أو تطبيقية لمدة سنتين بعد الثانوية العامة.",
      descEn: "Two-year applied or vocational study program after high school.",
    },
    {
      id: "bridging",
      titleAr: "برنامج التجسير",
      titleEn: "Bridging Program",
      descAr: "لحملة الدبلوم المتوسط الراغبين في إكمال دراستهم للحصول على البكالوريوس.",
      descEn: "For diploma holders wanting to transition into a Bachelor's program.",
    },
  ];

  const studentTypes = [
    {
      id: "local",
      titleAr: "طالب فلسطيني (ثانوية عامة فلسطينية)",
      titleEn: "Palestinian Student (Local Tawjihi)",
    },
    {
      id: "international",
      titleAr: "طالب وافد (ثانوية عامة غير فلسطينية)",
      titleEn: "International Student (Foreign Certificate)",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar" ? "1. نوع الالتحاق بالجامعة" : "1. University Admission Type"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "يرجى تحديد البرنامج الأكاديمي ونوع الشهادة التي تحملها للبدء بالطلب."
            : "Please specify the academic degree program and certificate type you hold."}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "اختر درجة الدراسة *" : "Select Study Degree *"}
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            {admissionTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => onChange({ admissionType: type.id })}
                className={`flex flex-col text-start p-5 rounded-2xl border-2 transition ${
                  data.admissionType === type.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/20 hover:bg-muted/50"
                }`}
              >
                <span className="font-bold text-foreground">
                  {locale === "ar" ? type.titleAr : type.titleEn}
                </span>
                <span className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {locale === "ar" ? type.descAr : type.descEn}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground block">
            {locale === "ar" ? "نوع الطالب / شهادة الثانوية العامة *" : "Student Type / High School Certificate *"}
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            {studentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => onChange({ studentType: type.id })}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-start ${
                  data.studentType === type.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/20 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`size-4 rounded-full border flex items-center justify-center ${
                    data.studentType === type.id ? "border-primary" : "border-muted-foreground"
                  }`}
                >
                  {data.studentType === type.id && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm font-bold text-foreground">
                  {locale === "ar" ? type.titleAr : type.titleEn}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

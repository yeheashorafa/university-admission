/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Edit2, AlertTriangle } from "lucide-react";
import type { ApplicationWizardState } from "../../types/application-form.types";
import { governorates } from "../../data/palestine-addresses.data";
import { programOptions } from "../../data/application.data";

import {
  QUALIFICATION_TYPES,
  DESIRED_STUDY_LEVELS,
} from "../../constants/qualification.constants";

import { usePublicFacultiesQuery } from "@/hooks/queries/use-public-catalog-queries";

type ReviewStepProps = {
  state: ApplicationWizardState;
  onGoToStep: (stepId: number) => void;
};

export function ReviewStep({ state, onGoToStep }: ReviewStepProps) {
  const locale = useLocale();
  const t = useTranslations("application");
  const { data: faculties } = usePublicFacultiesQuery();

  const allCatalogPrograms = useMemo(() => {
    if (!faculties || !Array.isArray(faculties)) return [];
    const list: Array<{ id: string; titleAr?: string; titleEn?: string }> = [];
    for (const fac of faculties) {
      if (Array.isArray(fac.departments)) {
        for (const dep of fac.departments) {
          if (Array.isArray(dep.programs)) {
            for (const prog of dep.programs) {
              list.push({
                id: String(prog.id),
                titleAr: prog.name_ar || prog.name || prog.title,
                titleEn: prog.name_en || prog.name || prog.title,
              });
            }
          }
        }
      }
    }
    return list;
  }, [faculties]);

  const getGovernorateName = (id: string) => {
    const gov = governorates.find((g) => g.id === id);
    if (!gov) return id;
    return locale === "ar" ? gov.nameAr : gov.nameEn;
  };

  const getProgramName = (id: string | number) => {
    const strId = String(id);
    const catalogMatch = allCatalogPrograms.find((p) => p.id === strId);
    if (catalogMatch) {
      return (locale === "ar" ? catalogMatch.titleAr : catalogMatch.titleEn) || catalogMatch.titleAr || catalogMatch.titleEn || strId;
    }
    const prog = programOptions.find((p) => p.id === strId);
    if (!prog) return `البرنامج #${strId}`;
    return t(`programOptions.${prog.id}.title`);
  };

  const getRelationName = (rel: string) => {
    if (rel === "father") return locale === "ar" ? "الأب" : "Father";
    if (rel === "mother") return locale === "ar" ? "الأم" : "Mother";
    if (rel === "brother") return locale === "ar" ? "الأخ" : "Brother";
    if (rel === "uncle") return locale === "ar" ? "العم / الخال" : "Uncle";
    return locale === "ar" ? "آخر" : "Other";
  };

  const qualTypeLabel =
    QUALIFICATION_TYPES.find((q) => q.id === state.qualificationData?.qualification_type)?.[
      locale === "ar" ? "labelAr" : "labelEn"
    ] || state.qualificationData?.qualification_type || "-";

  const desiredLevelLabel =
    DESIRED_STUDY_LEVELS.find((d) => d.id === state.qualificationData?.desired_study_level)?.[
      locale === "ar" ? "labelAr" : "labelEn"
    ] || state.qualificationData?.desired_study_level || "-";

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-foreground">
          {locale === "ar" ? "10. مراجعة الطلب الكامل" : "10. Full Application Review"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {locale === "ar"
            ? "يرجى مراجعة كافة البيانات المدخلة بعناية والتأكد من مطابقتها قبل الانتقال للاعتماد النهائي."
            : "Please review all entered information carefully to ensure correctness before submitting."}
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Qualification Data */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-primary text-base">
              {locale === "ar" ? "1. بيانات التوجيهي والمؤهل" : "1. Qualification & Admission Data"}
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
            >
              <Edit2 className="size-3" />
              {locale === "ar" ? "تعديل" : "Edit"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "نوع القبول (الشهادة)" : "Qualification Type"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {qualTypeLabel}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "درجة الدراسة المطلوبة" : "Desired Study Level"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {desiredLevelLabel}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "سنة الدراسة/التوجيهي" : "Qualification Year"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.qualificationData?.qualification_year || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {state.qualificationData?.verification_method === "seat_number"
                  ? locale === "ar" ? "رقم الجلوس" : "Seat Number"
                  : locale === "ar" ? "رقم الهوية" : "National ID"}
              </span>
              <span className="font-bold text-foreground mt-1 block font-mono">
                {state.qualificationData?.verification_method === "seat_number"
                  ? state.qualificationData?.seat_number || "-"
                  : state.qualificationData?.national_id || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {state.qualificationData?.result_check_method === "percentage"
                  ? locale === "ar" ? "نسبة توجيهي" : "Tawjihi Percentage"
                  : locale === "ar" ? "مجموع درجات توجيهي" : "Tawjihi Total Score"}
              </span>
              <span className="font-bold text-foreground mt-1 block text-primary font-mono">
                {state.qualificationData?.result_check_method === "percentage"
                  ? state.qualificationData?.tawjihi_percentage !== undefined
                    ? `${state.qualificationData.tawjihi_percentage}%`
                    : "-"
                  : state.qualificationData?.tawjihi_total_score || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "حالة التحقق من الوزارة" : "Ministry Verification Status"}
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 mt-1 block text-xs">
                {state.qualificationData?.verificationSource === "pending_backend_api"
                  ? locale === "ar" ? "قيد الربط عند التوفر (PENDING_BACKEND_API)" : "Pending Integration (PENDING_BACKEND_API)"
                  : state.qualificationData?.isQualificationVerified
                  ? locale === "ar" ? "تم التحقق" : "Verified"
                  : locale === "ar" ? "إدخال يدوي" : "Manual"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Admission Type */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-primary text-base">
              {locale === "ar" ? "2. نوع الالتحاق والدرجة" : "2. Admission & Degree Type"}
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
            >
              <Edit2 className="size-3" />
              {locale === "ar" ? "تعديل" : "Edit"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "درجة الدراسة" : "Study Degree"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.admissionType.admissionType === "bachelor"
                  ? locale === "ar" ? "درجة البكالوريوس" : "Bachelor Degree"
                  : state.admissionType.admissionType === "diploma"
                  ? locale === "ar" ? "درجة الدبلوم المتوسط" : "Associate Diploma"
                  : locale === "ar" ? "برنامج التجسير" : "Bridging Program"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "نوع الطالب والشهادة" : "Student Type"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.admissionType.studentType === "local"
                  ? locale === "ar" ? "طالب فلسطيني (توجيهي محلي)" : "Local Palestinian"
                  : locale === "ar" ? "طالب وافد (شهادة خارجية)" : "International Student"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Tawjihi Data */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-primary text-base">
              {locale === "ar" ? "3. بيانات الثانوية العامة التفصيلية" : "3. Detailed High School Data"}
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(3)}
              className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
            >
              <Edit2 className="size-3" />
              {locale === "ar" ? "تعديل" : "Edit"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "فرع الدراسة" : "Branch"}
              </span>
              <span className="font-bold text-foreground mt-1 block capitalize">
                {state.tawjihi.studyProgram === "scientific"
                  ? locale === "ar" ? "علمي" : "Scientific"
                  : state.tawjihi.studyProgram === "literary"
                  ? locale === "ar" ? "أدبي" : "Literary"
                  : state.tawjihi.studyProgram === "industrial"
                  ? locale === "ar" ? "صناعي" : "Industrial"
                  : state.tawjihi.studyProgram === "commercial"
                  ? locale === "ar" ? "ريادة وأعمال" : "Commercial"
                  : state.tawjihi.studyProgram === "sharia"
                  ? locale === "ar" ? "شرعي" : "Sharia"
                  : state.tawjihi.studyProgram}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "سنة الحصول عليها" : "Year"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.tawjihi.studyYear}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "رقم الجلوس" : "Seat Number"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.tawjihi.seatNumber}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "مجموع العلامات" : "Total Marks"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.tawjihi.totalMarks}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "النسبة المئوية" : "Percentage"}
              </span>
              <span className="font-bold text-foreground mt-1 block text-primary">
                {state.tawjihi.percentage}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "رقم الهوية الوطنية" : "National ID"}
              </span>
              <span className="font-bold text-foreground mt-1 block font-mono">
                {state.tawjihi.nationalId}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Basic Personal Data */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-primary text-base">
              {locale === "ar" ? "4. بيانات الطالب الأساسية" : "4. Basic Personal Details"}
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(4)}
              className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
            >
              <Edit2 className="size-3" />
              {locale === "ar" ? "تعديل" : "Edit"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "مكان وتاريخ الميلاد" : "Birth Place & Date"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.basicData.birthPlace} ({state.basicData.birthCountry}) - {state.basicData.birthDate}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "الاسم الكامل (بالإنجليزي)" : "Full Name (in English)"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.basicData.firstNameEn} {state.basicData.fatherNameEn} {state.basicData.grandfatherNameEn} {state.basicData.lastNameEn}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Guardian Data */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-primary text-base">
              {locale === "ar" ? "5. بيانات ولي الأمر" : "5. Guardian Details"}
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(5)}
              className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
            >
              <Edit2 className="size-3" />
              {locale === "ar" ? "تعديل" : "Edit"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "اسم ولي الأمر وصلة القرابة" : "Guardian & Relation"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.guardian.guardianName} ({getRelationName(state.guardian.guardianRelationship)})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "رقم هوية ولي الأمر" : "Guardian ID"}
              </span>
              <span className="font-bold text-foreground mt-1 block font-mono">
                {state.guardian.guardianNationalId}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "جوال ولي الأمر" : "Guardian Mobile"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.guardian.guardianPhone}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "مهنة ولي الأمر ومكان العمل" : "Occupation & Workplace"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.guardian.guardianJob} - {state.guardian.guardianWorkplace}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "حالة الأب والعمل" : "Father Status & Work"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.guardian.fatherStatus === "alive" ? (locale === "ar" ? "حي" : "Alive") : (locale === "ar" ? "متوفى" : "Deceased")}{" "}
                / {state.guardian.fatherWorks === "yes" ? (locale === "ar" ? "يعمل" : "Works") : (locale === "ar" ? "لا يعمل" : "Does not work")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "عمل الأم" : "Mother's Work"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.guardian.motherWorks === "yes" ? (locale === "ar" ? "تعمل" : "Works") : (locale === "ar" ? "لا تعمل" : "Does not work")}
              </span>
            </div>
          </div>
        </div>

        {/* Section 6: Address & Contact */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-primary text-base">
              {locale === "ar" ? "6. العنوان وبيانات الاتصال" : "6. Address & Contacts"}
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(6)}
              className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
            >
              <Edit2 className="size-3" />
              {locale === "ar" ? "تعديل" : "Edit"}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "العنوان بالتفصيل" : "Detailed Address"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {getGovernorateName(state.contact.governorate)} / {state.contact.city} / {state.contact.neighborhood}{" "}
                {state.contact.street && `- ${state.contact.street}`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">
                {locale === "ar" ? "البريد وجوال الاتصال" : "Email & Mobile"}
              </span>
              <span className="font-bold text-foreground mt-1 block">
                {state.contact.email} / {state.contact.mobile}
              </span>
            </div>
          </div>
        </div>

        {/* Section 7: Preferences */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-primary text-base">
              {locale === "ar" ? "7. رغبات الطالب المختارة" : "7. Program Preferences"}
            </h4>
            <button
              type="button"
              onClick={() => onGoToStep(7)}
              className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
            >
              <Edit2 className="size-3" />
              {locale === "ar" ? "تعديل" : "Edit"}
            </button>
          </div>
          {state.preferences.preferences.length === 0 ? (
            <p className="text-sm text-red-500 font-bold">
              {locale === "ar" ? "تنبيه: لم تحدد أي رغبة حتى الآن!" : "Warning: No program preference selected!"}
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {state.preferences.preferences.map((pId, idx) => (
                <div key={pId} className="flex items-center gap-3">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-foreground">{getProgramName(String(pId))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 8 & 9: Photo & Documents */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Photo */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-primary text-base">
                {locale === "ar" ? "8. الصورة الشخصية" : "8. Personal Photo"}
              </h4>
              <button
                type="button"
                onClick={() => onGoToStep(8)}
                className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
              >
                <Edit2 className="size-3" />
                {locale === "ar" ? "تعديل" : "Edit"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              {state.photo.photoUrl ? (
                <>
                  <img
                    src={state.photo.photoUrl}
                    alt="Student Photo"
                    className="size-16 rounded-full object-cover border"
                  />
                  <span className="text-sm text-green-700 font-bold">
                    {locale === "ar" ? "تم تحميل الصورة بنجاح" : "Uploaded successfully"}
                  </span>
                </>
              ) : (
                <span className="text-sm text-red-500 font-bold flex items-center gap-1">
                  <AlertTriangle className="size-4 shrink-0" />
                  {locale === "ar" ? "لم يتم رفع صورة شخصية!" : "No photo uploaded!"}
                </span>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-primary text-base">
                {locale === "ar" ? "9. مستندات وثبوتيات الطلب" : "9. Documents Upload"}
              </h4>
              <button
                type="button"
                onClick={() => onGoToStep(9)}
                className="text-xs font-bold text-[#265e1b] dark:text-[#8bd63a] flex items-center gap-1 hover:underline"
              >
                <Edit2 className="size-3" />
                {locale === "ar" ? "تعديل" : "Edit"}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {state.documents.documents.map((doc) => (
                <div key={doc.documentTypeId} className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground">
                    {doc.fileName || (locale === "ar" ? `مستند (${doc.documentTypeId})` : `Document (${doc.documentTypeId})`)}
                  </span>
                  {doc.uploaded ? (
                    <span className="text-green-700 font-bold">
                      {locale === "ar" ? "مرفوع" : "Uploaded"}
                    </span>
                  ) : doc.pledge ? (
                    <span className="text-yellow-700 font-bold">
                      {locale === "ar" ? "تم التعهد" : "Pledged"}
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold">
                      {locale === "ar" ? "مطلوب" : "Required"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createTranslator } from "next-intl";
import { ArrowLeft, ChevronDown, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import type { AdminProgramEditor } from "../data/admin-programs.data";
import { useAdminFacultiesQuery } from "@/hooks/queries";
import { useAdminBranchesQuery } from "@/hooks/queries/use-admin-branches-queries";
import { useAdminAdmissionCyclesQuery } from "@/hooks/queries/use-admin-queries";
import type { AdminProgramDetailsPayload } from "@/services/admin-programs.service";
import {
  getInitialOpenProgramSections,
  openProgramFormErrorSection,
  setProgramFormSectionOpen,
  type ProgramFormSectionId,
} from "../data/program-form-sections";

export type ProgramFormSubmission = {
  program: AdminProgramEditor;
  details: AdminProgramDetailsPayload;
};
type Props = {
  mode: "create" | "edit";
  program?: AdminProgramEditor | null;
  onClose: () => void;
  onSubmit: (value: ProgramFormSubmission) => Promise<void> | void;
  isSubmitting?: boolean;
};
const editorMessages = {
  "ar": {
    "management": "إدارة التخصصات",
    "createTitle": "إضافة تخصص",
    "editTitle": "تعديل تخصص",
    "description": "تُستخدم هذه البيانات لعرض صفحة التخصص للمتقدمين.",
    "back": "العودة إلى التخصصات",
    "identity": "التعريف والوصف",
    "cancel": "إلغاء",
    "saving": "جارٍ الحفظ…",
    "create": "إضافة",
    "save": "حفظ",
    "needsAttention": "يحتاج مراجعة",
    "degreeNotSet": "الدرجة غير محددة",
    "years": "سنوات",
    "durationNotSet": "المدة غير محددة",
    "currencyPerHour": "د.أ/ساعة",
    "creditHoursShort": "ساعة",
    "unnamedCycle": "دورة غير مسماة",
    "feeMissing": "لا توجد رسوم مسجلة",
    "thresholdsCount": "مفاتيح قبول",
    "linksCount": "روابط",
    "overviewAvailable": "النظرة العامة متوفرة",
    "overviewMissing": "النظرة العامة غير متوفرة",
    "preview": "معاينة صفحة التخصص",
    "detailsColumn": "تفاصيل التخصص",
    "paginationLabel": "التنقل بين صفحات التخصصات",
    "feeDetails": "بيانات الرسوم",
    "open": "مفتوحة",
    "male": "ذكر",
    "female": "أنثى",
    "remove": "حذف",
    "addThreshold": "إضافة حد قبول",
    "thresholdEmpty": "لم تُضف مفاتيح قبول لهذه الدورة بعد.",
    "thresholdBranch": "الفرع الدراسي",
    "thresholdGender": "الجنس",
    "addLink": "إضافة رابط",
    "linksEmpty": "لا توجد روابط مضافة لهذا التخصص بعد.",
    "addLinkTitle": "إضافة رابط للتخصص",
    "editLinkTitle": "تعديل رابط التخصص",
    "openLink": "فتح الرابط في نافذة جديدة",
    "editLink": "تعديل الرابط",
    "closeDialog": "إغلاق النافذة",
    "saveLink": "حفظ الرابط",
    "linkKinds": {
      "study_plan": "الخطة الدراسية",
      "program_page": "صفحة التخصص",
      "other": "رابط آخر"
    },
    "addCareer": "إضافة فرصة عمل",
    "addObjective": "إضافة هدف",
    "addOutcome": "إضافة مخرج للخريج",
    "courseCode": "رمز المساق",
    "courseNameAr": "اسم المساق بالعربية",
    "courseNameEn": "اسم المساق بالإنجليزية",
    "courseCredits": "الساعات المعتمدة",
    "semester": "الفصل الدراسي",
    "level": "المستوى الدراسي",
    "courseType": "نوع المساق",
    "required": "إجباري",
    "elective": "اختياري",
    "removeCourse": "حذف المساق",
    "learningTitles": {
      "careers": "فرص العمل",
      "objectives": "الأهداف",
      "outcomes": "مخرجات الخريج"
    },
    "noOpenCycle": "لا توجد دورة قبول مفتوحة حالياً. حدّث تواريخ دورة قائمة أو اترك الرسوم دون دورة.",
    "careerInput": "أدخل اسم المهنة",
    "degreeLevels": {
      "bachelor": "بكالوريوس",
      "master": "ماجستير",
      "doctorate": "دكتوراه"
    },
    "sections": {
      "identity": "بيانات التخصص",
      "study": "الدراسة",
      "fees": "الرسوم ودورة القبول",
      "thresholds": "مفاتيح القبول",
      "links": "روابط التخصص",
      "learning": "فرص العمل"
    },
    "fields": {
      "nameAr": "الاسم بالعربية",
      "nameEn": "الاسم بالإنجليزية",
      "faculty": "الكلية",
      "selectFaculty": "اختر الكلية",
      "minimumAverage": "متوسط القبول العام",
      "overviewAr": "النظرة العامة بالعربية",
      "overviewEn": "النظرة العامة بالإنجليزية",
      "whyStudyAr": "لماذا ندرس التخصص بالعربية",
      "whyStudyEn": "لماذا ندرس التخصص بالإنجليزية",
      "degree": "الدرجة العلمية",
      "selectDegree": "اختر الدرجة العلمية",
      "degreeAr": "الدرجة بالعربية",
      "degreeEn": "الدرجة بالإنجليزية",
      "duration": "مدة الدراسة بالسنوات",
      "cycle": "دورة القبول",
      "selectCycle": "اختر دورة القبول",
      "hourlyFee": "سعر الساعة بالدينار",
      "creditHours": "عدد الساعات",
      "feeSource": "مصدر الرسوم",
      "selectBranch": "اختر الفرع",
      "percentage": "النسبة المئوية",
      "thresholdSource": "مصدر حد القبول",
      "httpsUrl": "رابط HTTPS",
      "linkKind": "نوع الرابط",
      "labelAr": "العنوان بالعربية",
      "labelEn": "العنوان بالإنجليزية"
    },
    "validation": {
      "nameAr": "الاسم بالعربية مطلوب.",
      "nameEn": "الاسم بالإنجليزية مطلوب.",
      "faculty": "اختر الكلية.",
      "average": "أدخل نسبة بين 0 و100.",
      "career": "أدخل فرصة العمل بالعربية.",
      "objective": "أدخل الهدف بالعربية.",
      "outcome": "أدخل مخرج الخريج بالعربية.",
      "course": "أدخل اسم المساق والساعات.",
      "cycle": "اختر دورة القبول قبل حفظ بياناتها.",
      "feePair": "أدخل سعر الساعة وعدد الساعات معاً.",
      "feePositive": "أدخل سعراً موجباً.",
      "hoursPositive": "أدخل عدداً صحيحاً موجباً للساعات.",
      "https": "يجب أن يبدأ الرابط بـ HTTPS.",
      "threshold": "تحقق من الفرع والنسبة.",
      "thresholdDuplicate": "لا تكرر الفرع والجنس في الدورة نفسها.",
      "link": "أدخل نوع الرابط واسماً عربياً ورابط HTTPS."
    }
  },
  "en": {
    "management": "Program management",
    "createTitle": "Add program",
    "editTitle": "Edit program",
    "description": "This information appears on the public program page.",
    "back": "Back to programs",
    "identity": "Identity and overview",
    "cancel": "Cancel",
    "saving": "Saving…",
    "create": "Create",
    "save": "Save",
    "needsAttention": "Needs attention",
    "degreeNotSet": "Degree not set",
    "years": "years",
    "durationNotSet": "Duration not set",
    "currencyPerHour": "JOD/hour",
    "creditHoursShort": "credits",
    "unnamedCycle": "Unnamed cycle",
    "feeMissing": "No fee recorded",
    "thresholdsCount": "admission thresholds",
    "linksCount": "links",
    "overviewAvailable": "Overview available",
    "overviewMissing": "Overview missing",
    "preview": "Preview program",
    "detailsColumn": "Program details",
    "paginationLabel": "Program pagination",
    "feeDetails": "Fee details",
    "open": "Open",
    "male": "Male",
    "female": "Female",
    "remove": "Remove",
    "addThreshold": "Add threshold",
    "thresholdEmpty": "No admission thresholds have been added for this cycle yet.",
    "thresholdBranch": "Academic branch",
    "thresholdGender": "Gender",
    "addLink": "Add link",
    "linksEmpty": "No links have been added to this program yet.",
    "addLinkTitle": "Add program link",
    "editLinkTitle": "Edit program link",
    "openLink": "Open link in a new tab",
    "editLink": "Edit link",
    "closeDialog": "Close dialog",
    "saveLink": "Save link",
    "linkKinds": {
      "study_plan": "Study plan",
      "program_page": "Program page",
      "other": "Other link"
    },
    "addCareer": "Add career opportunity",
    "addObjective": "Add objective",
    "addOutcome": "Add graduate outcome",
    "courseCode": "Course code",
    "courseNameAr": "Course name in Arabic",
    "courseNameEn": "Course name in English",
    "courseCredits": "Credit hours",
    "semester": "Semester",
    "level": "Study level",
    "courseType": "Course type",
    "required": "Required",
    "elective": "Elective",
    "removeCourse": "Remove course",
    "learningTitles": {
      "careers": "Career opportunities",
      "objectives": "Objectives",
      "outcomes": "Graduate outcomes"
    },
    "noOpenCycle": "No admission cycle is currently open. Update a cycle date range or leave fees unassigned.",
    "careerInput": "Enter a career name",
    "degreeLevels": {
      "bachelor": "Bachelor's degree",
      "master": "Master's degree",
      "doctorate": "Doctorate"
    },
    "sections": {
      "identity": "Program details",
      "study": "Study information",
      "fees": "Fees and admission cycle",
      "thresholds": "Admission thresholds",
      "links": "Program links",
      "learning": "Career opportunities"
    },
    "fields": {
      "nameAr": "Arabic name",
      "nameEn": "English name",
      "faculty": "Faculty",
      "selectFaculty": "Select faculty",
      "minimumAverage": "General minimum average",
      "overviewAr": "Overview in Arabic",
      "overviewEn": "Overview in English",
      "whyStudyAr": "Why study this program in Arabic",
      "whyStudyEn": "Why study this program in English",
      "degree": "Degree level",
      "selectDegree": "Select a degree level",
      "degreeAr": "Degree in Arabic",
      "degreeEn": "Degree in English",
      "duration": "Duration in years",
      "cycle": "Admission cycle",
      "selectCycle": "Select an admission cycle",
      "hourlyFee": "Price per credit hour",
      "creditHours": "Credit hours",
      "feeSource": "Fee source",
      "selectBranch": "Select a branch",
      "percentage": "Percentage",
      "thresholdSource": "Threshold source",
      "httpsUrl": "HTTPS URL",
      "linkKind": "Link type",
      "labelAr": "Arabic label",
      "labelEn": "English label"
    },
    "validation": {
      "nameAr": "Arabic name is required.",
      "nameEn": "English name is required.",
      "faculty": "Select a faculty.",
      "average": "Enter a value between 0 and 100.",
      "career": "Enter the career opportunity in Arabic.",
      "objective": "Enter the objective in Arabic.",
      "outcome": "Enter the graduate outcome in Arabic.",
      "course": "Enter the course name and credit hours.",
      "cycle": "Select an admission cycle before saving its data.",
      "feePair": "Enter both the hourly fee and credit hours.",
      "feePositive": "Enter a positive fee.",
      "hoursPositive": "Enter a positive whole number of credit hours.",
      "https": "The URL must use HTTPS.",
      "threshold": "Check the branch and percentage.",
      "thresholdDuplicate": "Branch and gender must be unique in this cycle.",
      "link": "Enter a link type, Arabic label, and HTTPS URL."
    }
  }
};

const input =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
const area =
  "min-h-24 w-full rounded-lg border border-input bg-card p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";

type Threshold = {
  branch_id: number;
  gender: "male" | "female";
  min_average_percent: number;
  source_url?: string | null;
};
type ProgramLink = {
  kind: string;
  label_ar: string;
  label_en: string;
  url: string;
  sort_order: number;
  is_active?: boolean;
};
type DegreeLevel = "bachelor" | "master" | "doctorate" | "";
const degreeLabels = {
  bachelor: { ar: "بكالوريوس", en: "Bachelor's degree" },
  master: { ar: "ماجستير", en: "Master's degree" },
  doctorate: { ar: "دكتوراه", en: "Doctorate" },
} as const;

function inferDegreeLevel(ar: string, en: string): DegreeLevel {
  const value = `${ar} ${en}`.toLowerCase();
  if (value.includes("دكتور") || value.includes("doctor")) return "doctorate";
  if (value.includes("ماجستير") || value.includes("master")) return "master";
  if (value.includes("بكالوريوس") || value.includes("bachelor")) return "bachelor";
  return "";
}
type ProgramFormError = {
  section: ProgramFormSectionId;
  field: string;
  message: string;
  rowIndex?: number;
};

export function AdminProgramForm({
  mode,
  program,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const formKey = `${mode}-${program?.id ?? "new"}`;
  return (
    <FormBody
      key={formKey}
      mode={mode}
      program={program}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}

function FormBody({
  mode,
  program,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const locale = useLocale();
  const t = createTranslator({ locale, messages: editorMessages[locale === "ar" ? "ar" : "en"] });
  const { data: rawFaculties = [] } = useAdminFacultiesQuery();
  const faculties = rawFaculties as Record<string, unknown>[];
  const branchesQuery = useAdminBranchesQuery();
  const cyclesQuery = useAdminAdmissionCyclesQuery();
  const branches = (branchesQuery.data ?? []) as Record<string, unknown>[];
  const cycles = (cyclesQuery.data ?? []) as Record<string, unknown>[];
  const activeCycle = cycles.find((item) => item.status === "open");
  const initialCycleId = String(activeCycle?.id ?? program?.details.fees[0]?.admission_cycle_id ?? "");
  const existingFee = program?.details.fees.find(
    (item) => String(item.admission_cycle_id ?? "") === initialCycleId,
  );
  const [nameAr, setNameAr] = useState(program?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(program?.nameEn ?? "");
  const [descriptionAr, setDescriptionAr] = useState(
    program?.descriptionAr ?? "",
  );
  const [descriptionEn, setDescriptionEn] = useState(
    program?.descriptionEn ?? "",
  );
  const [facultyId, setFacultyId] = useState(program?.facultyId ?? "");
  const [minimumAverage, setMinimumAverage] = useState(
    program?.minimumAverage == null ? "" : String(program.minimumAverage),
  );
  const [whyAr, setWhyAr] = useState(program?.details.whyStudyAr ?? "");
  const [whyEn, setWhyEn] = useState(program?.details.whyStudyEn ?? "");
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>(
    inferDegreeLevel(program?.details.degreeAr ?? "", program?.details.degreeEn ?? ""),
  );
  const [duration, setDuration] = useState(
    program?.details.durationYears == null
      ? ""
      : String(program.details.durationYears),
  );
  const [cycleId, setCycleId] = useState(
    initialCycleId,
  );
  const [feePrice, setFeePrice] = useState(
    existingFee ? String(existingFee.price_per_hour_dinar) : "",
  );
  const [feeHours, setFeeHours] = useState(
    existingFee ? String(existingFee.credit_hours) : "",
  );
  const [thresholds, setThresholds] = useState<Threshold[]>(
    program?.details.admissionThresholds
      .filter((x) => String(x.admission_cycle_id ?? "") === String(cycleId))
      .map((x) => ({
        branch_id: x.branch_id,
        gender: x.gender,
        min_average_percent: Number(x.min_average_percent),
        source_url: x.source_url,
      })) ?? [],
  );
  const [links, setLinks] = useState<ProgramLink[]>(
    program?.details.links
      .filter((x) => String(x.admission_cycle_id ?? "") === String(cycleId))
      .map((x) => ({
        kind: x.kind,
        label_ar: x.label_ar ?? "",
        label_en: x.label_en ?? "",
        url: x.url,
        sort_order: x.sort_order,
        is_active: x.is_active,
      })) ?? [],
  );
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [linkDraft, setLinkDraft] = useState<ProgramLink>({
    kind: "study_plan",
    label_ar: "",
    label_en: "",
    url: "",
    sort_order: 0,
  });
  const [linkDraftError, setLinkDraftError] = useState("");
  const [careers, setCareers] = useState(
    program?.details.careerOpportunities.map((x) => ({
      ar: x.ar,
      en: x.en ?? "",
    })) ?? [],
  );
  const [fieldError, setFieldError] = useState<ProgramFormError | null>(null);
  const [openSections, setOpenSections] = useState(getInitialOpenProgramSections);

  function failValidation(error: ProgramFormError) {
    setFieldError(error);
    setOpenSections((previous) =>
      openProgramFormErrorSection(previous, error.section),
    );
  }

  function changeCycle(nextCycleId: string) {
    setCycleId(nextCycleId);
    const fee = program?.details.fees.find(
      (item) => String(item.admission_cycle_id ?? "") === nextCycleId,
    );
    setFeePrice(fee ? String(fee.price_per_hour_dinar) : "");
    setFeeHours(fee ? String(fee.credit_hours) : "");
    setThresholds(
      program?.details.admissionThresholds
        .filter((item) => String(item.admission_cycle_id ?? "") === nextCycleId)
        .map((item) => ({
          branch_id: item.branch_id,
          gender: item.gender,
          min_average_percent: Number(item.min_average_percent),
          source_url: item.source_url,
        })) ?? [],
    );
    setLinks(
      program?.details.links
        .filter((item) => String(item.admission_cycle_id ?? "") === nextCycleId)
        .map((item) => ({
          kind: item.kind,
          label_ar: item.label_ar ?? "",
          label_en: item.label_en ?? "",
          url: item.url,
          sort_order: item.sort_order,
          is_active: item.is_active,
        })) ?? [],
    );
  }

  function openLinkEditor(index?: number) {
    setEditingLinkIndex(index ?? null);
    setLinkDraft(index == null ? {
      kind: "study_plan",
      label_ar: "",
      label_en: "",
      url: "",
      sort_order: links.length,
    } : { ...links[index] });
    setLinkDraftError("");
    setLinkModalOpen(true);
  }

  function saveLinkDraft() {
    if (!linkDraft.kind.trim() || !linkDraft.label_ar.trim() || !/^https:\/\//i.test(linkDraft.url)) {
      setLinkDraftError(t("validation.link"));
      return;
    }
    setLinks((previous) => editingLinkIndex == null
      ? [...previous, { ...linkDraft, sort_order: previous.length }]
      : previous.map((item, index) => index === editingLinkIndex ? { ...linkDraft, sort_order: index } : item));
    setLinkModalOpen(false);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);
    if (!nameAr.trim()) {
      return failValidation({ section: "identity", field: "name_ar", message: t("validation.nameAr") });
    }
    if (!nameEn.trim()) {
      return failValidation({ section: "identity", field: "name_en", message: t("validation.nameEn") });
    }
    if (!facultyId) {
      return failValidation({ section: "identity", field: "faculty_id", message: t("validation.faculty") });
    }
    if (minimumAverage.trim() && (!Number.isFinite(Number(minimumAverage)) || Number(minimumAverage) < 0 || Number(minimumAverage) > 100)) {
      return failValidation({ section: "identity", field: "minimum_average", message: t("validation.average") });
    }
    const invalidCareer = careers.findIndex((row) => !row.ar.trim());
    if (invalidCareer >= 0) {
      return failValidation({ section: "learning", field: "career", rowIndex: invalidCareer, message: t("validation.career") });
    }
    if (Boolean(feePrice) !== Boolean(feeHours))
      return failValidation({ section: "fees", field: feePrice ? "fee_hours" : "fee_price", message: t("validation.feePair") });
    if (feePrice && (!Number.isFinite(Number(feePrice)) || Number(feePrice) <= 0))
      return failValidation({ section: "fees", field: "fee_price", message: t("validation.feePositive") });
    if (feeHours && (!Number.isInteger(Number(feeHours)) || Number(feeHours) <= 0))
      return failValidation({ section: "fees", field: "fee_hours", message: t("validation.hoursPositive") });
    const invalidThresholdIndex = thresholds.findIndex((x) =>
      !x.branch_id || !Number.isFinite(x.min_average_percent) || x.min_average_percent < 0 || x.min_average_percent > 100,
    );
    if (invalidThresholdIndex >= 0)
      return failValidation({ section: "thresholds", field: "thresholds", rowIndex: invalidThresholdIndex, message: t("validation.threshold") });
    const duplicateThresholdIndex = thresholds.findIndex((x, i) =>
      thresholds.findIndex((y) => y.branch_id === x.branch_id && y.gender === x.gender) !== i,
    );
    if (duplicateThresholdIndex >= 0)
      return failValidation({ section: "thresholds", field: "thresholds", rowIndex: duplicateThresholdIndex, message: t("validation.thresholdDuplicate") });
    const invalidLinkIndex = links.findIndex((x) =>
      !x.kind.trim() || !x.label_ar.trim() || !/^https:\/\//i.test(x.url),
    );
    if (invalidLinkIndex >= 0)
      return failValidation({ section: "links", field: "links", rowIndex: invalidLinkIndex, message: t("validation.link") });
    const faculty = faculties.find((x) => String(x.id) === facultyId);
    const facultyName = String(
      locale === "ar"
        ? faculty?.name_ar || faculty?.name_en || ""
        : faculty?.name_en || faculty?.name_ar || "",
    );
    const parsedAverage = minimumAverage.trim() ? Number(minimumAverage) : null;
    const savedFee = program?.details.fees.find((item) => String(item.admission_cycle_id ?? "") === cycleId);
    const savedThresholds = program?.details.admissionThresholds
      .filter((item) => String(item.admission_cycle_id ?? "") === cycleId)
      .map(({ branch_id, gender, min_average_percent, source_url }) => ({
        branch_id, gender, min_average_percent: Number(min_average_percent), source_url,
      })) ?? [];
    const savedLinks = program?.details.links
      .filter((item) => String(item.admission_cycle_id ?? "") === cycleId)
      .map(({ kind, label_ar, label_en, url, sort_order, is_active }) => ({
        kind, label_ar: label_ar ?? "", label_en: label_en ?? "", url, sort_order, is_active,
      })) ?? [];
    const savedCareers = program?.details.careerOpportunities.map(({ ar, en }) => ({ ar, en: en ?? "" })) ?? [];
    const details: AdminProgramDetailsPayload = {};

    if (whyAr !== (program?.details.whyStudyAr ?? "")) details.why_study_ar = whyAr || null;
    if (whyEn !== (program?.details.whyStudyEn ?? "")) details.why_study_en = whyEn || null;
    if (degreeLevel !== inferDegreeLevel(program?.details.degreeAr ?? "", program?.details.degreeEn ?? "")) {
      details.degree_level_ar = degreeLevel ? degreeLabels[degreeLevel].ar : null;
      details.degree_level_en = degreeLevel ? degreeLabels[degreeLevel].en : null;
    }
    if (duration !== String(program?.details.durationYears ?? "")) details.duration_years = duration ? Number(duration) : null;
    if (feePrice && (Number(feePrice) !== Number(savedFee?.price_per_hour_dinar) || Number(feeHours) !== savedFee?.credit_hours)) {
      details.fee = {
        price_per_hour_dinar: Number(feePrice),
        credit_hours: Number(feeHours),
        source_url: savedFee?.source_url,
      };
    }
    if (JSON.stringify(thresholds) !== JSON.stringify(savedThresholds)) details.admission_thresholds = thresholds;
    if (JSON.stringify(links) !== JSON.stringify(savedLinks)) details.links = links;
    if (JSON.stringify(careers) !== JSON.stringify(savedCareers)) details.career_opportunities = careers;
    if (details.fee || details.admission_thresholds || details.links) {
      details.admission_cycle_id = cycleId ? Number(cycleId) : null;
    }
    const value: ProgramFormSubmission = {
      program: {
        id: program?.id ?? "",
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        facultyId,
        facultyName,
        minimumAverage: parsedAverage,
        isActive: program?.isActive ?? true,
        details: program?.details ?? {
          whyStudyAr: "",
          whyStudyEn: "",
          degreeAr: degreeLevel ? degreeLabels[degreeLevel].ar : "",
          degreeEn: degreeLevel ? degreeLabels[degreeLevel].en : "",
          durationYears: null,
          fees: [],
          admissionThresholds: [],
          links: [],
          careerOpportunities: [],
          objectives: [],
          graduateOutcomes: [],
          courses: [],
        },
      },
      details,
    };
    void onSubmit(value);
  }

  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-muted/40 px-5 py-5 md:px-7">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("management")}</p>
            <h2 className="mt-1 text-2xl font-bold text-primary">
              {mode === "create"
                ? t("createTitle")
                : t("editTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted" aria-label={t("back")}>
            <ArrowLeft className="size-4" />
            <span>{t("back")}</span>
          </button>
        </header>
        <form noValidate onSubmit={submit} className="grid gap-4 p-5 md:p-7">
          <ProgramFormSection
            id="identity"
            title={t("sections.identity")}
            isOpen={openSections.has("identity")}
            hasError={fieldError?.section === "identity"}
            onToggle={(isOpen) => setOpenSections((previous) => setProgramFormSectionOpen(previous, "identity", isOpen))}
          >
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("fields.nameAr")} error={fieldError?.field === "name_ar" ? fieldError.message : undefined}>
              <input
                required
                dir="rtl"
                className={input}
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </Field>
            <Field label={t("fields.nameEn")} error={fieldError?.field === "name_en" ? fieldError.message : undefined}>
              <input
                required
                dir="ltr"
                className={input}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </Field>
            <Field label={t("fields.faculty")} error={fieldError?.field === "faculty_id" ? fieldError.message : undefined}>
              <select
                required
                className={input}
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
              >
                <option value="">{t("fields.selectFaculty")}</option>
                {faculties.map((f: Record<string, unknown>) => (
                  <option key={String(f.id)} value={String(f.id)}>
                    {String(
                      locale === "ar"
                        ? f.name_ar || f.name_en
                        : f.name_en || f.name_ar,
                    )}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("fields.minimumAverage")} error={fieldError?.field === "minimum_average" ? fieldError.message : undefined}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                className={input}
                value={minimumAverage}
                onChange={(e) => setMinimumAverage(e.target.value)}
              />
            </Field>
            <Field label={t("fields.overviewAr")}>
              <textarea
                dir="rtl"
                className={area}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
              />
            </Field>
            <Field label={t("fields.overviewEn")}>
              <textarea
                dir="ltr"
                className={area}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
              />
            </Field>
          </div>
          </ProgramFormSection>
          <ProgramFormSection
            id="study"
            title={t("sections.study")}
            isOpen={openSections.has("study")}
            onToggle={(isOpen) => setOpenSections((previous) => setProgramFormSectionOpen(previous, "study", isOpen))}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Field label={t("fields.whyStudyAr")}>
                <textarea dir="rtl" className={area} value={whyAr} onChange={(e) => setWhyAr(e.target.value)} />
              </Field>
              <Field label={t("fields.whyStudyEn")}>
                <textarea dir="ltr" className={area} value={whyEn} onChange={(e) => setWhyEn(e.target.value)} />
              </Field>
              <Field label={t("fields.degree")}>
                <select className={input} value={degreeLevel} onChange={(e) => setDegreeLevel(e.target.value as DegreeLevel)}>
                  <option value="">{t("fields.selectDegree")}</option>
                  <option value="bachelor">{t("degreeLevels.bachelor")}</option>
                  <option value="master">{t("degreeLevels.master")}</option>
                  <option value="doctorate">{t("degreeLevels.doctorate")}</option>
                </select>
              </Field>
              <Field label={t("fields.duration")}>
                <input type="number" min="1" max="15" className={input} value={duration} onChange={(e) => setDuration(e.target.value)} />
              </Field>
            </div>
          </ProgramFormSection>
          <ProgramFormSection
            id="fees"
            title={t("sections.fees")}
            isOpen={openSections.has("fees")}
            hasError={fieldError?.section === "fees"}
            onToggle={(isOpen) => setOpenSections((previous) => setProgramFormSectionOpen(previous, "fees", isOpen))}
          >
          {!activeCycle && (
            <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-800 dark:text-amber-200">
              {t("noOpenCycle")}
            </p>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label={t("fields.cycle")} error={fieldError?.field === "cycle_id" ? fieldError.message : undefined}>
              <select
                className={input}
                value={cycleId}
                onChange={(e) => changeCycle(e.target.value)}
              >
                <option value="">{t("fields.selectCycle")}</option>
                {cycles.map((c) => (
                  <option key={String(c.id)} value={String(c.id)}>
                    {String(c.name || c.academic_year || c.id)}
                    {c.status === "open" ? ` (${t("open")})` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("fields.hourlyFee")} error={fieldError?.field === "fee_price" ? fieldError.message : undefined}>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className={input}
                value={feePrice}
                onChange={(e) => setFeePrice(e.target.value)}
              />
            </Field>
            <Field label={t("fields.creditHours")} error={fieldError?.field === "fee_hours" ? fieldError.message : undefined}>
              <input
                type="number"
                min="1"
                className={input}
                value={feeHours}
                onChange={(e) => setFeeHours(e.target.value)}
              />
            </Field>
          </div>
          </ProgramFormSection>
          <ProgramFormSection
            id="thresholds"
            title={t("sections.thresholds")}
            isOpen={openSections.has("thresholds")}
            hasError={fieldError?.section === "thresholds"}
            onToggle={(isOpen) => setOpenSections((previous) => setProgramFormSectionOpen(previous, "thresholds", isOpen))}
          >
          <div className="grid gap-4">
            {thresholds.length === 0 && (
              <p className="rounded-lg bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                {t("thresholdEmpty")}
              </p>
            )}
            {thresholds.map((row, i) => (
              <div
                key={i}
                className="grid items-end gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                {fieldError?.field === "thresholds" && fieldError.rowIndex === i && <p role="alert" className="text-sm text-destructive sm:col-span-2 lg:col-span-full">{fieldError.message}</p>}
                <Field label={t("thresholdBranch")}>
                  <select
                    required
                    className={input}
                    value={row.branch_id || ""}
                    onChange={(e) => setThresholds((old) => old.map((x, n) => n === i ? { ...x, branch_id: Number(e.target.value) } : x))}
                  >
                    <option value="">{t("fields.selectBranch")}</option>
                    {branches.map((b) => (
                      <option key={String(b.id)} value={String(b.id)}>
                        {String(locale === "ar" ? b.name_ar || b.name_en : b.name_en || b.name_ar)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("thresholdGender")}>
                  <select
                    className={input}
                    value={row.gender}
                    onChange={(e) => setThresholds((old) => old.map((x, n) => n === i ? { ...x, gender: e.target.value as Threshold["gender"] } : x))}
                  >
                    <option value="male">{t("male")}</option>
                    <option value="female">{t("female")}</option>
                  </select>
                </Field>
                <Field label={t("fields.percentage")}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className={input}
                    value={row.min_average_percent}
                    onChange={(e) => setThresholds((old) => old.map((x, n) => n === i ? { ...x, min_average_percent: Number(e.target.value) } : x))}
                  />
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    setThresholds((old) => old.filter((_, n) => n !== i))
                  }
                  aria-label={t("remove")}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-3 text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10 sm:justify-self-start"
              onClick={() =>
                setThresholds((old) => [
                  ...old,
                  { branch_id: 0, gender: "male", min_average_percent: 0 },
                ])
              }
            >
              <Plus size={16} /> {t("addThreshold")}
            </button>
          </div>
          </ProgramFormSection>
          <ProgramFormSection
            id="links"
            title={t("sections.links")}
            isOpen={openSections.has("links")}
            hasError={fieldError?.section === "links"}
            onToggle={(isOpen) => setOpenSections((previous) => setProgramFormSectionOpen(previous, "links", isOpen))}
          >
          <div className="grid gap-3">
            {links.length === 0 && (
              <p className="rounded-lg bg-muted/40 px-4 py-3 text-sm text-muted-foreground">{t("linksEmpty")}</p>
            )}
            {links.map((link, index) => (
              <article key={`${link.url}-${index}`} className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{locale === "ar" ? link.label_ar || link.label_en : link.label_en || link.label_ar}</h3>
                  <p className="mt-1 min-w-0 break-all text-sm leading-5 text-muted-foreground" dir="ltr">{link.url}</p>
                  <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{link.kind === "study_plan" ? t("linkKinds.study_plan") : link.kind === "program_page" ? t("linkKinds.program_page") : link.kind === "other" ? t("linkKinds.other") : link.kind}</span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a href={link.url} target="_blank" rel="noreferrer" aria-label={t("openLink")} className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-card"><ExternalLink className="size-4" /></a>
                  <button type="button" onClick={() => openLinkEditor(index)} aria-label={t("editLink")} className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-card"><Pencil className="size-4" /></button>
                  <button type="button" onClick={() => setLinks((old) => old.filter((_, itemIndex) => itemIndex !== index))} aria-label={t("remove")} className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button>
                </div>
              </article>
            ))}
            <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10 sm:justify-self-start" onClick={() => openLinkEditor()}>
              <Plus size={16} /> {t("addLink")}
            </button>
          </div>
          {linkModalOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLinkModalOpen(false); }}>
              <section role="dialog" aria-modal="true" aria-labelledby="program-link-dialog-title" className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                  <h2 id="program-link-dialog-title" className="text-lg font-bold text-primary">{editingLinkIndex == null ? t("addLinkTitle") : t("editLinkTitle")}</h2>
                  <button type="button" onClick={() => setLinkModalOpen(false)} aria-label={t("closeDialog")} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><X className="size-4" /></button>
                </header>
                <div className="grid gap-4 p-5">
                  <Field label={t("fields.linkKind")}>
                    <select className={input} value={linkDraft.kind} onChange={(event) => setLinkDraft((old) => ({ ...old, kind: event.target.value }))}>
                      <option value="study_plan">{t("linkKinds.study_plan")}</option>
                      <option value="program_page">{t("linkKinds.program_page")}</option>
                      <option value="other">{t("linkKinds.other")}</option>
                    </select>
                  </Field>
                  <Field label={t("fields.labelAr")}>
                    <input className={input} value={linkDraft.label_ar} onChange={(event) => setLinkDraft((old) => ({ ...old, label_ar: event.target.value }))} />
                  </Field>
                  <Field label={t("fields.labelEn")}>
                    <input className={input} dir="ltr" value={linkDraft.label_en} onChange={(event) => setLinkDraft((old) => ({ ...old, label_en: event.target.value }))} />
                  </Field>
                  <Field label={t("fields.httpsUrl")}>
                    <input className={input} dir="ltr" type="url" value={linkDraft.url} onChange={(event) => setLinkDraft((old) => ({ ...old, url: event.target.value }))} />
                  </Field>
                  {linkDraftError && <p role="alert" className="text-sm text-destructive">{linkDraftError}</p>}
                </div>
                <footer className="flex flex-col-reverse justify-end gap-2 border-t border-border px-5 py-4 sm:flex-row">
                  <button type="button" onClick={() => setLinkModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">{t("cancel")}</button>
                  <button type="button" onClick={saveLinkDraft} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{t("saveLink")}</button>
                </footer>
              </section>
            </div>
          )}
          </ProgramFormSection>
          <ProgramFormSection
            id="learning"
            title={t("sections.learning")}
            isOpen={openSections.has("learning")}
            hasError={fieldError?.section === "learning"}
            onToggle={(isOpen) => setOpenSections((previous) => setProgramFormSectionOpen(previous, "learning", isOpen))}
          >
          <CareerTags
            rows={careers}
            setRows={setCareers}
            error={fieldError?.field === "career" ? fieldError : undefined}
          />
          </ProgramFormSection>
          <footer className="sticky bottom-0 z-20 -mx-5 flex flex-col-reverse justify-between gap-2 border-t border-border bg-card/95 px-5 py-3 backdrop-blur sm:flex-row sm:justify-end sm:gap-3 md:-mx-7 md:px-7">
            <button
              type="button"
              className="w-full rounded-lg border px-4 py-2 sm:w-auto"
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              disabled={isSubmitting || !faculties.length}
              className="w-full rounded-lg bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting
                ? t("saving")
                : mode === "create"
                  ? t("create")
                  : t("save")}
            </button>
          </footer>
        </form>
      </section>
  );
}
function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {children}
      {error && <span role="alert" className="text-xs font-normal text-destructive">{error}</span>}
    </label>
  );
}

function ProgramFormSection({
  id,
  title,
  isOpen,
  hasError,
  onToggle,
  children,
}: {
  id: ProgramFormSectionId;
  title: string;
  isOpen: boolean;
  hasError?: boolean;
  onToggle: (isOpen: boolean) => void;
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const sectionT = createTranslator({ locale, messages: editorMessages[locale === "ar" ? "ar" : "en"] });
  return (
    <section id={`program-form-section-${id}`} className="rounded-xl border border-border bg-card">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`program-form-panel-${id}`}
        onClick={() => onToggle(!isOpen)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-start font-semibold hover:bg-muted/50"
      >
        <span className="flex items-center gap-2">
          {title}
          {hasError && <span className="text-xs font-normal text-destructive">{sectionT("needsAttention")}</span>}
        </span>
        <ChevronDown aria-hidden="true" className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div id={`program-form-panel-${id}`} hidden={!isOpen} className="grid gap-3 p-4 pt-0">{children}</div>
    </section>
  );
}
function CareerTags({
  rows,
  setRows,
  error,
}: {
  rows: Array<{ ar: string; en: string }>;
  setRows: React.Dispatch<React.SetStateAction<Array<{ ar: string; en: string }>>>;
  error?: ProgramFormError;
}) {
  const locale = useLocale();
  const t = createTranslator({ locale, messages: editorMessages[locale === "ar" ? "ar" : "en"] });
  const [draft, setDraft] = useState("");

  function addCareer() {
    const value = draft.trim();
    if (!value) return;
    setRows((previous) => [...previous, locale === "ar" ? { ar: value, en: "" } : { ar: "", en: value }]);
    setDraft("");
  }

  return (
    <div className="grid gap-3">
      <div className="flex min-h-10 flex-wrap gap-2">
        {rows.map((row, index) => (
          <span key={`${row.ar}-${row.en}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-foreground">
            {locale === "ar" ? row.ar || row.en : row.en || row.ar}
            <button type="button" aria-label={t("remove")} onClick={() => setRows((previous) => previous.filter((_, i) => i !== index))} className="rounded-full text-muted-foreground hover:text-destructive">
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input className={input} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCareer(); } }} aria-label={t("careerInput")} placeholder={t("careerInput")} />
        <button type="button" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-primary/30 px-4 text-sm font-semibold text-primary transition hover:bg-primary/10" onClick={addCareer}>
          <Plus size={16} /> {t("addCareer")}
        </button>
      </div>
    </div>
  );
}

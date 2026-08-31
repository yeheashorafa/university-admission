"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, ArrowLeft, ArrowRight, Save, Loader2, AlertCircle } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { isVerificationError, extractApiError } from "@/lib/api/api-error";
import { isUserVerified } from "@/services/auth.service";
import { isAccountVerificationBypassed } from "@/lib/auth-verification";
import { useAuthStore } from "@/stores/auth.store";
import {
  getMyProfile,
  updateMyProfile,
  hasVerifiedTawjihiRecord,
  getStudentNationalId,
  getSocialInformationFromProfile,
  type StudentProfile,
} from "@/services/profile.service";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  createStudentApplication,
  getApplicationDocumentChecklist,
  submitStudentApplication,
  updateApplicationPreferences,
  getStudentApplicationById,
  getStudentApplications,
  type StudentApplicationDetail,
} from "@/services/application.service";
import { attachDocumentToApplication } from "@/services/documents.service";
import { usePublicAdmissionCyclesQuery, useDocumentTypesQuery } from "@/hooks/queries/use-public-catalog-queries";
import {
  getSocialInformation,
  updateSocialInformation,
  type SocialInformation,
  type BirthPlace,
  type FatherStatus,
  type GuardianProfession,
  type GuardianRelationship,
  type GuardianWorkplace,
} from "@/services/social-information.service";

import { isAdmissionCycleOpen } from "@/services/public-catalog.service";
import type { ApplicationWizardState } from "../types/application-form.types";
import { DEFAULT_QUALIFICATION_DATA } from "../constants/qualification.constants";
import { applicationSteps } from "../data/application.data";
import { QualificationDataStep } from "./steps/qualification-data-step";
import { AdmissionTypeStep } from "./steps/admission-type-step";
import { TawjihiDataStep } from "./steps/tawjihi-data-step";
import { BasicDataStep } from "./steps/basic-data-step";
import { GuardianDataStep } from "./steps/guardian-data-step";
import { ContactDataStep } from "./steps/contact-data-step";
import { PreferencesStep } from "./steps/preferences-step";
import { PhotoStep } from "./steps/photo-step";
import { DocumentsStep } from "./steps/documents-step";
import { ReviewStep } from "./steps/review-step";
import { FinalConfirmationStep } from "./steps/final-confirmation-step";

// CONFIRMED_BACKEND_DEFAULT: application_type_id=1 is the backend default for normal student admission.
const CONFIRMED_BACKEND_DEFAULT_APPLICATION_TYPE_ID = 1;

export function ApplicationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("application");
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [isUnverified, setIsUnverified] = useState<boolean>(() => isUserVerified(user) === false);

  const { data: admissionCycles, isLoading: isLoadingCycles } = usePublicAdmissionCyclesQuery();
  const { data: documentTypes } = useDocumentTypesQuery();

  const activeCycles = useMemo(() => {
    if (!admissionCycles || !Array.isArray(admissionCycles)) return [];
    return admissionCycles.filter(isAdmissionCycleOpen);
  }, [admissionCycles]);

  const activeCycle = activeCycles[0];
  const activeCycleId = activeCycle?.id;
  const noOpenCycle = !isLoadingCycles && activeCycles.length === 0;

  const activeAppTypeId = CONFIRMED_BACKEND_DEFAULT_APPLICATION_TYPE_ID;

  const applicationId = searchParams.get("id");
  const [targetId, setTargetId] = useState<string | null>(applicationId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedProfile, setLoadedProfile] = useState<StudentProfile | null>(null);

  const hasTawjihiRecord = loadedProfile ? hasVerifiedTawjihiRecord(loadedProfile) : true;

  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<ApplicationWizardState>({
    qualificationData: DEFAULT_QUALIFICATION_DATA,
    admissionType: { admissionType: "bachelor", studentType: "local" },
    tawjihi: {
      lastCertificate: "tawjihi",
      studyProgram: "",
      studyYear: "",
      seatNumber: "",
      totalMarks: "",
      percentage: "",
      nationalId: "",
    },
    basicData: {
      birthPlace: "",
      birthCountry: "Palestine",
      birthDate: "",
      firstNameEn: "",
      fatherNameEn: "",
      grandfatherNameEn: "",
      lastNameEn: "",
    },
    guardian: {
      guardianRelationship: "",
      guardianName: "",
      guardianNationalId: "",
      guardianWorkplace: "",
      fatherStatus: "alive",
      fatherWorks: "yes",
      motherWorks: "no",
      guardianJob: "",
      guardianPhone: "",
    },
    contact: {
      governorate: "",
      city: "",
      neighborhood: "",
      street: "",
      email: "",
      phone: "",
      mobile: "",
    },
    preferences: { preferences: [] },
    photo: { photoUrl: null },
    documents: {
      documents: [],
    },
    confirmation: { confirmData: false, agreeTerms: false },
  });

  const userIsUnverified = isUnverified || isUserVerified(user) === false;

  useEffect(() => {
    if (userIsUnverified) {
      return;
    }

    async function loadBackendData() {
      try {
        const [profileRes, socialRes] = await Promise.allSettled([
          getMyProfile(),
          getSocialInformation(),
        ]);

        let verificationErrorDetected = false;

        if (profileRes.status === "rejected" && isVerificationError(profileRes.reason)) {
          verificationErrorDetected = true;
        }
        if (socialRes.status === "rejected" && isVerificationError(socialRes.reason)) {
          verificationErrorDetected = true;
        }

        if (verificationErrorDetected && !isAccountVerificationBypassed()) {
          setIsUnverified(true);
          return;
        }

        let resolvedNationalId = "";
        let embeddedSocial: SocialInformation | null = null;

        if (profileRes.status === "fulfilled" && profileRes.value) {
          const p = profileRes.value;
          setLoadedProfile(p);
          resolvedNationalId = getStudentNationalId(p, user) || "";
          embeddedSocial = getSocialInformationFromProfile(p);
          const pi = p.personal_information;

          setState((curr) => ({
            ...curr,
            qualificationData: {
              ...curr.qualificationData,
              national_id: curr.qualificationData.national_id || resolvedNationalId || "",
            },
            tawjihi: {
              ...curr.tawjihi,
              nationalId: resolvedNationalId || curr.tawjihi.nationalId,
              firstNameAr: curr.tawjihi.firstNameAr || pi?.first_name_ar || "",
              fatherNameAr: curr.tawjihi.fatherNameAr || pi?.father_name_ar || "",
              grandfatherNameAr: curr.tawjihi.grandfatherNameAr || pi?.grandfather_name_ar || "",
              familyNameAr: curr.tawjihi.familyNameAr || pi?.family_name_ar || "",
              gender: curr.tawjihi.gender || pi?.gender || "male",
              nationality: curr.tawjihi.nationality || pi?.nationality || "ps",
            },
            contact: {
              ...curr.contact,
              email: curr.contact.email || p.email || user?.email || "",
              mobile: curr.contact.mobile || p.phone || user?.phone || "",
            },
            // Apply embedded social info if present as preliminary baseline
            ...(embeddedSocial
              ? {
                  basicData: {
                    ...curr.basicData,
                    birthPlace: curr.basicData.birthPlace || (embeddedSocial as Record<string, string>).birth_place || (embeddedSocial as Record<string, string>).place_of_birth || "",
                    birthDate: curr.basicData.birthDate || (embeddedSocial as Record<string, string>).birth_date || (embeddedSocial as Record<string, string>).date_of_birth || "",
                    firstNameEn: curr.basicData.firstNameEn || embeddedSocial.first_name_en || "",
                    fatherNameEn: curr.basicData.fatherNameEn || embeddedSocial.father_name_en || "",
                    grandfatherNameEn: curr.basicData.grandfatherNameEn || embeddedSocial.grandfather_name_en || "",
                    lastNameEn: curr.basicData.lastNameEn || embeddedSocial.family_name_en || "",
                  },
                  guardian: {
                    ...curr.guardian,
                    guardianName: curr.guardian.guardianName || embeddedSocial.guardian_name || "",
                    guardianNationalId: curr.guardian.guardianNationalId || embeddedSocial.guardian_national_id || "",
                    guardianRelationship: curr.guardian.guardianRelationship || embeddedSocial.guardian_relationship || "",
                    guardianJob: curr.guardian.guardianJob || embeddedSocial.guardian_profession || "",
                    guardianWorkplace: curr.guardian.guardianWorkplace || embeddedSocial.guardian_workplace || "",
                    guardianPhone: curr.guardian.guardianPhone || embeddedSocial.guardian_phone || "",
                    fatherStatus: (embeddedSocial.father_status as FatherStatus) || curr.guardian.fatherStatus || "alive",
                    fatherWorks: curr.guardian.fatherWorks || (embeddedSocial.father_is_working ? "yes" : "no"),
                    motherWorks: curr.guardian.motherWorks || (embeddedSocial.mother_is_working ? "yes" : "no"),
                  },
                  contact: {
                    ...curr.contact,
                    email: curr.contact.email || p.email || user?.email || "",
                    mobile: curr.contact.mobile || p.phone || user?.phone || "",
                    governorate: curr.contact.governorate || embeddedSocial.governorate || "",
                    city: curr.contact.city || embeddedSocial.city || "",
                    neighborhood: curr.contact.neighborhood || embeddedSocial.neighborhood || "",
                    street: curr.contact.street || embeddedSocial.street || "",
                    phone: curr.contact.phone || embeddedSocial.phone_landline || "",
                  },
                }
              : {}),
          }));
        }

        if (socialRes.status === "fulfilled" && socialRes.value) {
          const s = socialRes.value as Record<string, unknown>;
          setState((curr) => ({
            ...curr,
            basicData: {
              ...curr.basicData,
              birthPlace: (s.birth_place as string) || (s.place_of_birth as string) || curr.basicData.birthPlace,
              birthDate: (s.birth_date as string) || (s.date_of_birth as string) || curr.basicData.birthDate,
              firstNameEn: (s.first_name_en as string) || curr.basicData.firstNameEn,
              fatherNameEn: (s.father_name_en as string) || curr.basicData.fatherNameEn,
              grandfatherNameEn: (s.grandfather_name_en as string) || curr.basicData.grandfatherNameEn,
              lastNameEn: (s.family_name_en as string) || (s.last_name_en as string) || curr.basicData.lastNameEn,
            },
            guardian: {
              ...curr.guardian,
              guardianName: (s.guardian_name as string) || curr.guardian.guardianName,
              guardianNationalId: (s.guardian_national_id as string) || curr.guardian.guardianNationalId,
              guardianRelationship: (s.guardian_relationship as string) || curr.guardian.guardianRelationship,
              guardianJob: (s.guardian_profession as string) || (s.guardian_job as string) || curr.guardian.guardianJob,
              guardianWorkplace: (s.guardian_workplace as string) || curr.guardian.guardianWorkplace,
              guardianPhone: (s.guardian_phone as string) || curr.guardian.guardianPhone,
              fatherStatus: (s.father_status as FatherStatus) || curr.guardian.fatherStatus,
              fatherWorks: typeof s.father_is_working === "boolean" ? (s.father_is_working ? "yes" : "no") : curr.guardian.fatherWorks,
              motherWorks: typeof s.mother_is_working === "boolean" ? (s.mother_is_working ? "yes" : "no") : curr.guardian.motherWorks,
            },
            contact: {
              ...curr.contact,
              governorate: (s.governorate as string) || curr.contact.governorate,
              city: (s.city as string) || curr.contact.city,
              neighborhood: (s.neighborhood as string) || curr.contact.neighborhood,
              street: (s.street as string) || curr.contact.street,
              phone: (s.phone_landline as string) || curr.contact.phone,
            },
          }));
        }
      } catch {
        // ignore load errors to allow draft form editing
      }
    }
    loadBackendData();
  }, [userIsUnverified, user]);

  const updateSection = <K extends keyof ApplicationWizardState>(
    section: K,
    updatedData: Partial<ApplicationWizardState[K]>
  ) => {
    setState((curr) => ({
      ...curr,
      [section]: {
        ...curr[section],
        ...updatedData,
      },
    }));
  };

  const handleResetQualification = () => {
    setState((curr) => ({
      ...curr,
      qualificationData: DEFAULT_QUALIFICATION_DATA,
    }));
    toast.success(
      locale === "ar"
        ? "تم إعادة تعيين بيانات التوجيهي إلى القيم الافتراضية"
        : "Qualification details reset to default values"
    );
  };

  const validateStep = (step: number): boolean => {
    // Step 1: Qualification Data ("بيانات التوجيهي")
    if (step === 1) {
      const {
        qualification_type,
        desired_study_level,
        qualification_year,
        verification_method,
        seat_number,
        national_id,
        result_check_method,
        tawjihi_percentage,
        tawjihi_total_score,
      } = state.qualificationData;

      if (
        !qualification_type ||
        !desired_study_level ||
        !qualification_year ||
        !verification_method ||
        !result_check_method
      ) {
        toast.error(
          locale === "ar"
            ? "يرجى تعبئة جميع حقول بيانات التوجيهي المطلوبة *"
            : "Please fill in all required qualification fields *"
        );
        return false;
      }

      if (verification_method === "seat_number") {
        if (!seat_number || !seat_number.trim()) {
          toast.error(
            locale === "ar" ? "رقم الجلوس مطلوب *" : "Seat number is required *"
          );
          return false;
        }
      } else if (verification_method === "national_id") {
        if (!national_id || !national_id.trim()) {
          toast.error(
            locale === "ar" ? "رقم الهوية مطلوب *" : "National ID is required *"
          );
          return false;
        }
      }

      if (result_check_method === "percentage") {
        if (
          tawjihi_percentage === undefined ||
          isNaN(tawjihi_percentage)
        ) {
          toast.error(
            locale === "ar" ? "نسبة توجيهي مطلوبة *" : "Percentage is required *"
          );
          return false;
        }
        if (tawjihi_percentage < 0 || tawjihi_percentage > 100) {
          toast.error(
            locale === "ar"
              ? "نسبة التوجيهي يجب أن تكون بين 0 و 100"
              : "Percentage must be between 0 and 100"
          );
          return false;
        }
      } else if (result_check_method === "total_score") {
        if (
          tawjihi_total_score === undefined ||
          isNaN(tawjihi_total_score)
        ) {
          toast.error(
            locale === "ar"
              ? "مجموع علامات التوجيهي مطلوب *"
              : "Total score is required *"
          );
          return false;
        }
        if (tawjihi_total_score <= 0) {
          toast.error(
            locale === "ar"
              ? "مجموع درجات التوجيهي يجب أن يكون أكثر من 0"
              : "Total score must be greater than 0"
          );
          return false;
        }
      }
    }

    // Step 2: Admission Type
    if (step === 2) {
      if (!state.admissionType.admissionType || !state.admissionType.studentType) {
        toast.error(
          locale === "ar"
            ? "يرجى اختيار درجة الدراسة ونوع الشهادة"
            : "Please select study degree and student type"
        );
        return false;
      }
    }

    // Step 3: Detailed Tawjihi Academic Data
    if (step === 3) {
      const { studyProgram, studyYear, seatNumber, totalMarks, percentage } =
        state.tawjihi;
      if (!studyProgram || !studyYear || !seatNumber || !totalMarks || !percentage) {
        toast.error(locale === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة *" : "Please fill in all required fields *");
        return false;
      }
      if (parseFloat(percentage) > 100) {
        toast.error(
          locale === "ar" ? "النسبة المئوية لا يمكن أن تتجاوز 100%" : "Percentage cannot exceed 100%"
        );
        return false;
      }
    }

    // Step 4: Basic Personal Data
    if (step === 4) {
      const { birthPlace, birthDate, firstNameEn, fatherNameEn, grandfatherNameEn, lastNameEn } =
        state.basicData;
      if (!birthPlace || !birthDate || !firstNameEn || !fatherNameEn || !grandfatherNameEn || !lastNameEn) {
        toast.error(locale === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة *" : "Please fill in all required fields *");
        return false;
      }
    }

    // Step 5: Guardian Data
    if (step === 5) {
      const {
        guardianRelationship,
        guardianName,
        guardianNationalId,
        guardianJob,
        guardianWorkplace,
        guardianPhone,
      } = state.guardian;
      if (
        !guardianRelationship ||
        !guardianName ||
        !guardianNationalId ||
        !guardianJob ||
        !guardianWorkplace ||
        !guardianPhone
      ) {
        toast.error(locale === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة *" : "Please fill in all required fields *");
        return false;
      }
      if (guardianNationalId.trim().length > 20) {
        toast.error(
          locale === "ar"
            ? "يجب ألا يتجاوز رقم هوية ولي الأمر 20 رقماً"
            : "Guardian ID must not exceed 20 digits"
        );
        return false;
      }
    }

    // Step 6: Contact Data
    if (step === 6) {
      const { governorate, city, neighborhood, email, mobile } = state.contact;
      if (!governorate || !city || !neighborhood || !email || !mobile) {
        toast.error(locale === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة *" : "Please fill in all required fields *");
        return false;
      }
    }

    // Step 7: Preferences
    if (step === 7) {
      if (state.preferences.preferences.length === 0) {
        toast.error(locale === "ar" ? "يجب إضافة رغبة واحدة على الأقل" : "Please select at least 1 preference");
        return false;
      }
    }

    // Step 8: Photo
    if (step === 8) {
      if (!state.photo.photoUrl) {
        const hasPhotoDocType = Array.isArray(documentTypes) && documentTypes.some(
          (dt) =>
            dt.name.toLowerCase().includes("photo") ||
            dt.name.toLowerCase().includes("personal") ||
            dt.name.includes("صورة") ||
            dt.name.includes("شخصية")
        );
        if (hasPhotoDocType) {
          toast.error(locale === "ar" ? "يرجى تحميل الصورة الشخصية للطالب" : "Please upload a personal photo");
          return false;
        }
      }
    }

    // Step 9: Documents
    if (step === 9) {
      const uncomplete = state.documents.documents.some((doc) => !doc.uploaded && !doc.pledge);
      if (uncomplete) {
        toast.error(
          locale === "ar"
            ? "يرجى رفع المستندات المطلوبة أو تفعيل خيار التعهد بالرفع اللاحق"
            : "Please upload required documents or toggle the pledge to submit later"
        );
        return false;
      }
    }

    // Step 11: Final Confirmation
    if (step === 11) {
      if (!hasTawjihiRecord) {
        toast.error(
          locale === "ar"
            ? "لا يوجد سجل توجيهي مرتبط برقم الهوية الخاص بك. يرجى التأكد من رقم الهوية أو مراجعة القبول والتسجيل."
            : "No verified Tawjihi record is linked to your National ID. Please verify your National ID or contact admissions."
        );
        return false;
      }
      if (!state.confirmation.confirmData || !state.confirmation.agreeTerms) {
        toast.error(
          locale === "ar"
            ? "يجب تأكيد صحة البيانات والموافقة على شروط الالتحاق"
            : "You must confirm data accuracy and agree to admission terms"
        );
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    try {
      if (currentStep === 1) {
        // PENDING_BACKEND_API: map qualificationData to backend once admission qualification endpoint or fields are provided.
        // Currently qualificationData remains in frontend draft state only.
      } else if (currentStep === 3) {
        // Do not call PUT /student/profile here. Secondary school fields are stored in local state only.
      } else if (currentStep === 4) {
        await updateSocialInformation({
          birth_place: state.basicData.birthPlace as BirthPlace,
          birth_date: state.basicData.birthDate,
          first_name_en: state.basicData.firstNameEn,
          father_name_en: state.basicData.fatherNameEn,
          grandfather_name_en: state.basicData.grandfatherNameEn,
          family_name_en: state.basicData.lastNameEn,
        });
      } else if (currentStep === 5) {
        await updateSocialInformation({
          guardian_name: state.guardian.guardianName,
          guardian_national_id: state.guardian.guardianNationalId,
          guardian_relationship: state.guardian.guardianRelationship as GuardianRelationship,
          guardian_profession: state.guardian.guardianJob as GuardianProfession,
          guardian_workplace: state.guardian.guardianWorkplace as GuardianWorkplace,
          guardian_phone: state.guardian.guardianPhone,
          father_status: state.guardian.fatherStatus as FatherStatus,
          father_is_working: state.guardian.fatherWorks === "yes",
          mother_is_working: state.guardian.motherWorks === "yes",
        });
      } else if (currentStep === 6) {
        await updateSocialInformation({
          governorate: state.contact.governorate,
          city: state.contact.city,
          neighborhood: state.contact.neighborhood,
          street: state.contact.street,
          phone_landline: state.contact.phone,
        });
        if (state.contact.mobile) {
          await updateMyProfile({ phone: state.contact.mobile });
        }
      } else if (currentStep === 7) {
        if (!activeCycleId) {
          toast.error(
            locale === "ar"
              ? "لا توجد دورة قبول مفتوحة حاليًا في الجامعة"
              : "No active admission cycle available currently"
          );
          return;
        }

        let activeId = targetId;
        if (!activeId) {
          if (!activeCycleId) {
            toast.error(
              locale === "ar"
                ? "لا توجد دورة قبول مفتوحة حالياً. تعذر إنشاء طلب الالتحاق."
                : "No active admission cycle available. Cannot create application."
            );
            return;
          }
          const firstProgramId = state.preferences.preferences[0];
          // Creation payload remains backend compatible: { application_type_id, admission_cycle_id, program_id }
          if (!activeAppTypeId) {
            toast.error(
              locale === "ar"
                ? "تعذر تحديد نوع الطلب من النظام"
                : "Failed to determine application type from system"
            );
            return;
          }
          // CONFIRMED_BACKEND_DEFAULT: application_type_id=1 is the backend default for normal student admission.
          const draft = await createStudentApplication({
            program_id: firstProgramId,
            application_type_id: activeAppTypeId,
            admission_cycle_id: activeCycleId,
          });
          activeId = String(draft.id);
          setTargetId(activeId);

          // Update React Query cache immediately
          queryClient.setQueryData(
            queryKeys.student.applications,
            (old: StudentApplicationDetail[] | undefined) => {
              const prev = Array.isArray(old) ? old : [];
              if (prev.some((a) => String(a.id) === String(draft.id))) return prev;
              return [draft, ...prev];
            }
          );
          queryClient.invalidateQueries({ queryKey: queryKeys.student.applications });
          queryClient.invalidateQueries({ queryKey: queryKeys.student.dashboard });
          queryClient.invalidateQueries({ queryKey: queryKeys.application.myApplication });
          queryClient.invalidateQueries({ queryKey: queryKeys.application.status });
        }
        if (state.preferences.preferences.length > 0) {
          await updateApplicationPreferences(activeId, state.preferences.preferences);
        }
      }
    } catch (error) {
      const apiError = extractApiError(error);
      if (apiError.status === 422) {
        toast.error(
          locale === "ar"
            ? "يرجى إكمال البيانات المطلوبة قبل المتابعة."
            : "Please complete the required information before continuing."
        );
        return;
      }
      toast.error(
        apiError.message ||
          (locale === "ar"
            ? "فشل حفظ البيانات. يرجى التحقق من الاتصال والمحاولة مرة أخرى."
            : "Failed to save details. Please check connection and try again.")
      );
      return;
    }

    const totalStepsCount = applicationSteps.length;
    if (currentStep < totalStepsCount) {
      setCurrentStep((c) => c + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Final Submit via Backend API
      setIsSubmitting(true);
      try {
        let activeId = targetId;
        if (!activeId) {
          if (!activeCycleId) {
            toast.error(
              locale === "ar"
                ? "لا توجد دورة قبول مفتوحة حالياً"
                : "No active admission cycle available"
            );
            setIsSubmitting(false);
            return;
          }
          const firstProgramId = state.preferences.preferences[0];
          if (!activeAppTypeId) {
            toast.error(
              locale === "ar"
                ? "تعذر تحديد نوع الطلب من النظام"
                : "Failed to determine application type from system"
            );
            setIsSubmitting(false);
            return;
          }
          // CONFIRMED_BACKEND_DEFAULT: application_type_id=1 is the backend default for normal student admission.
          const draft = await createStudentApplication({
            program_id: firstProgramId,
            application_type_id: activeAppTypeId,
            admission_cycle_id: activeCycleId,
          });
          activeId = String(draft.id);
          setTargetId(activeId);
        }

        if (state.preferences.preferences.length > 0) {
          await updateApplicationPreferences(activeId, state.preferences.preferences);
        }

        // Real checklist gate: verify required documents via backend checklist
        let checklist;
        try {
          checklist = await getApplicationDocumentChecklist(activeId);
        } catch (error) {
          const err = error as { message?: string };
          toast.error(
            err?.message ||
              (locale === "ar"
                ? "فشل التحقق من قائمة المستندات المطلوبة من الخادم. تعذر إرسال الطلب."
                : "Failed to verify document checklist from server. Submission blocked.")
          );
          setIsSubmitting(false);
          return;
        }

        const unsatisfiedRequired = checklist.filter((item) => {
          if (!item.isRequired || item.satisfied) return false;
          
          const rawItem = item as Record<string, unknown>;
          const canPledge = Boolean(item.canPledge || rawItem.can_pledge || rawItem.pledge_allowed);
          if (canPledge) {
            const targetDocTypeId = item.documentTypeId ?? item.id;
            const isPledgedLocally = state.documents.documents.some(
              (d) => String(d.documentTypeId) === String(targetDocTypeId) && d.pledge
            );
            if (isPledgedLocally) return false;
          }
          
          return true;
        });

        if (unsatisfiedRequired.length > 0) {
          const missingNames = unsatisfiedRequired
            .map((i) => i.documentTypeName || i.displayNameAr || i.displayNameEn)
            .join(", ");
          toast.error(
            locale === "ar"
              ? `تعذر تقديم الطلب: المستندات التالية مطلوبة وغير مكتملة (${missingNames})`
              : `Cannot submit: Required documents not satisfied (${missingNames})`
          );
          setIsSubmitting(false);
          return;
        }

        // Attach any uploaded documents before final submit
        for (const doc of state.documents.documents) {
          if (doc.uploaded && doc.uploadedDocumentId) {
            try {
              await attachDocumentToApplication(activeId, doc.uploadedDocumentId);
            } catch (error) {
              const errMsg = String((error as { message?: string })?.message || "").toLowerCase();
              const isAlreadyAttached =
                errMsg.includes("already attached") ||
                errMsg.includes("مرفق مسبق") ||
                errMsg.includes("موجود مسبق");

              if (!isAlreadyAttached) {
                toast.error(
                  locale === "ar"
                    ? "فشل إرفاق المستند بالطلب. تعذر التقديم."
                    : "Failed to attach document to application. Submission blocked."
                );
                setIsSubmitting(false);
                return;
              }
            }
          }
        }

        await submitStudentApplication(activeId);

        // Safety verification: verify refreshed detail and list
        let refreshedList: StudentApplicationDetail[] = [];
        try {
          const [, list] = await Promise.all([
            getStudentApplicationById(activeId),
            getStudentApplications(),
          ]);
          refreshedList = list;
        } catch {
          // continue to cache invalidation
        }

        const listContainsId =
          refreshedList.length === 0 ||
          refreshedList.some((a) => String(a.id) === String(activeId));

        // Await query cache invalidations
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.student.applications }),
          queryClient.invalidateQueries({ queryKey: queryKeys.student.dashboard }),
          queryClient.invalidateQueries({ queryKey: queryKeys.student.applicationDetail(activeId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.application.myApplication }),
          queryClient.invalidateQueries({ queryKey: queryKeys.application.status }),
        ]);

        if (!listContainsId && refreshedList.length > 0) {
          toast.warning(
            locale === "ar"
              ? "تم إرسال الطلب، لكن لم يتم تحديث قائمة طلباتي بعد. يرجى تحديث الصفحة أو التواصل مع الدعم."
              : "Application submitted, but My Applications list has not updated yet. Please refresh or contact support."
          );
        } else {
          toast.success(
            locale === "ar"
              ? "تم تقديم طلب الالتحاق بنجاح!"
              : "Admission application submitted successfully!"
          );
        }

        router.push(withLocale(locale, routes.applications));
      } catch (error: unknown) {
        const err = error as { message?: string; status?: number; data?: { errors?: Record<string, string[]> } };
        let errorMessage =
          err?.message ||
          (locale === "ar"
            ? "فشل في تقديم الطلب. يرجى التاكد من رفع كافة المستندات والبيانات المطلوبة."
            : "Failed to submit application. Please make sure all required documents and details are attached.");

        if (err?.data?.errors) {
          const formatted = Object.values(err.data.errors).flat().join(" - ");
          if (formatted) errorMessage = formatted;
        }

        const lowerMsg = errorMessage.toLowerCase();
        if (
          lowerMsg.includes("secondary school") ||
          lowerMsg.includes("tawjihi") ||
          lowerMsg.includes("سجل توجيهي")
        ) {
          errorMessage =
            locale === "ar"
              ? "لا يوجد سجل توجيهي مرتبط برقم الهوية الخاص بك. يرجى التأكد من رقم الهوية أو مراجعة القبول والتسجيل."
              : "No verified Tawjihi record is linked to your National ID. Please verify your National ID or contact admissions.";
        }

        toast.error(errorMessage);
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((c) => c - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(withLocale(locale, routes.dashboard));
    }
  };

  const totalSteps = applicationSteps.length;

  if (userIsUnverified) {
    return (
      <div className="mx-auto max-w-xl py-12 px-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <AlertCircle className="size-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200">
            {locale === "ar" ? "تأكيد الحساب مطلوب" : "Account Verification Required"}
          </h2>
          <p className="mt-2 text-base text-amber-800 dark:text-amber-300">
            {locale === "ar"
              ? "يرجى تفعيل حسابك قبل تعبئة طلب الالتحاق."
              : "Please verify your account before filling out the admission application."}
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={withLocale(locale, routes.verifyOtp)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              {locale === "ar" ? "الانتقال لتفعيل الحساب" : "Go to Account Verification"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {noOpenCycle && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-bold shadow-sm">
          <AlertCircle className="size-5 shrink-0 text-red-600" />
          <span>
            {locale === "ar"
              ? "تنبيه: لا توجد دورة قبول مفتوحة حاليًا في الجامعة."
              : "Notice: There is currently no open admission cycle available."}
          </span>
        </div>
      )}

      {/* Top Stepper Indicator */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-[0px_6px_25px_rgba(118,188,33,0.02)]">
        {/* Mobile Info */}
        <div className="flex items-center justify-between md:hidden">
          <span className="text-xs font-bold text-muted-foreground">
            {locale === "ar"
              ? `الخطوة ${currentStep} من ${totalSteps}`
              : `Step ${currentStep} of ${totalSteps}`}
          </span>
          <span className="text-sm font-extrabold text-primary">
            {t(`steps.${currentStep}`)}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden md:hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Desktop Step Circles */}
        <div className="hidden md:flex items-center justify-between gap-2 relative">
          <div className="absolute left-4 right-4 top-4 h-0.5 bg-muted z-0" />
          <div
            className="absolute left-4 top-4 h-0.5 bg-primary transition-all duration-300 z-0"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              right: locale === "ar" ? "auto" : undefined,
              left: locale === "ar" ? undefined : "1rem",
            }}
          />

          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => {
                  // Only allow jumping back to steps already verified or forward to currentStep
                  if (stepNum <= currentStep || isCompleted) {
                    setCurrentStep(stepNum);
                  }
                }}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
              >
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-all duration-200",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isActive && "bg-background border-primary text-primary ring-4 ring-primary/10 scale-105",
                    !isCompleted && !isActive && "bg-background border-muted text-muted-foreground group-hover:border-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : stepNum}
                </div>
                <span
                  className={cn(
                    "mt-2 text-[10px] font-bold max-w-[75px] text-center leading-normal transition truncate",
                    isActive && "text-primary scale-105",
                    isCompleted && "text-muted-foreground",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {t(`steps.${stepNum}`)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dynamic Step Component Box */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-[0px_12px_35px_rgba(118,188,33,0.03)] min-h-[400px]">
        {currentStep === 1 && (
          <QualificationDataStep
            data={state.qualificationData}
            onChange={(u) => updateSection("qualificationData", u)}
            onConfirm={handleNext}
            onReset={handleResetQualification}
          />
        )}
        {currentStep === 2 && (
          <AdmissionTypeStep
            data={state.admissionType}
            onChange={(u) => updateSection("admissionType", u)}
          />
        )}
        {currentStep === 3 && (
          <TawjihiDataStep
            data={state.tawjihi}
            onChange={(u) => updateSection("tawjihi", u)}
          />
        )}
        {currentStep === 4 && (
          <BasicDataStep
            data={state.basicData}
            onChange={(u) => updateSection("basicData", u)}
          />
        )}
        {currentStep === 5 && (
          <GuardianDataStep
            data={state.guardian}
            onChange={(u) => updateSection("guardian", u)}
          />
        )}
        {currentStep === 6 && (
          <ContactDataStep
            data={state.contact}
            onChange={(u) => updateSection("contact", u)}
          />
        )}
        {currentStep === 7 && (
          <PreferencesStep
            selectedIds={state.preferences.preferences}
            desiredStudyLevel={state.qualificationData.desired_study_level}
            onChange={(updatedIds) => updateSection("preferences", { preferences: updatedIds })}
          />
        )}
        {currentStep === 8 && (
          <PhotoStep
            photoUrl={state.photo.photoUrl}
            onChange={(url) => updateSection("photo", { photoUrl: url })}
            applicationId={targetId}
          />
        )}
        {currentStep === 9 && (
          <DocumentsStep
            documents={state.documents.documents}
            onChange={(docs) => updateSection("documents", { documents: docs })}
            applicationId={targetId}
          />
        )}
        {currentStep === 10 && (
          <ReviewStep
            state={state}
            onGoToStep={(stepId) => setCurrentStep(stepId)}
          />
        )}
        {currentStep === 11 && (
          <FinalConfirmationStep
            data={state.confirmation}
            onChange={(u) => updateSection("confirmation", u)}
            hasTawjihiRecord={hasTawjihiRecord}
          />
        )}
      </div>

      {/* Nav Buttons Footer */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border px-6 text-sm font-bold text-foreground hover:bg-muted transition active:scale-95 w-full sm:w-auto"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {locale === "ar" ? "السابق" : "Previous"}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting || (currentStep === totalSteps && loadedProfile !== null && !hasTawjihiRecord)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-extrabold text-primary-foreground shadow-md hover:bg-primary/95 transition hover:shadow-lg active:scale-95 disabled:opacity-50 w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : currentStep === totalSteps ? (
            <>
              <Save className="size-4" />
              {locale === "ar" ? "اعتماد وإرسال الطلب" : "Submit Admission Application"}
            </>
          ) : (
            <>
              {locale === "ar" ? "التالي" : "Next"}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export type QualificationTypeOption = {
  id: string;
  labelAr: string;
  labelEn: string;
};

export type DesiredStudyLevelOption = {
  id: string;
  labelAr: string;
  labelEn: string;
};

export const QUALIFICATION_TYPES: QualificationTypeOption[] = [
  { id: "high_school", labelAr: "ثانوية عامة", labelEn: "General High School (Tawjihi)" },
  { id: "intermediate_diploma", labelAr: "دبلوم متوسط", labelEn: "Intermediate Diploma" },
  { id: "specialized_vocational_diploma", labelAr: "دبلوم مهني متخصص", labelEn: "Specialized Vocational Diploma" },
  { id: "bachelor", labelAr: "بكالوريوس", labelEn: "Bachelor's Degree" },
  { id: "high_diploma", labelAr: "دبلوم عالي", labelEn: "Higher Diploma" },
  { id: "master", labelAr: "ماجستير", labelEn: "Master's Degree" },
  { id: "transfer", labelAr: "تحويل", labelEn: "Transfer" },
];

export const DESIRED_STUDY_LEVELS: DesiredStudyLevelOption[] = [
  { id: "bachelor", labelAr: "البكالوريوس", labelEn: "Bachelor" },
  { id: "master", labelAr: "الماجستير", labelEn: "Master" },
  { id: "doctorate", labelAr: "الدكتوراه", labelEn: "Doctorate" },
  { id: "educational_diploma", labelAr: "الدبلوم التربوي", labelEn: "Educational Diploma" },
];

export const QUALIFICATION_TO_STUDY_LEVELS: Record<
  string,
  { allowed: string[]; default: string }
> = {
  high_school: {
    allowed: ["bachelor"],
    default: "bachelor",
  },
  intermediate_diploma: {
    allowed: ["bachelor"],
    default: "bachelor",
  },
  specialized_vocational_diploma: {
    allowed: ["bachelor"],
    default: "bachelor",
  },
  bachelor: {
    allowed: ["bachelor", "master", "educational_diploma"],
    default: "bachelor",
  },
  high_diploma: {
    allowed: ["master"],
    default: "master",
  },
  master: {
    allowed: ["master", "doctorate"],
    default: "master",
  },
  transfer: {
    allowed: ["bachelor", "master", "doctorate"],
    default: "bachelor",
  },
};

export const DEFAULT_QUALIFICATION_DATA = {
  qualification_type: "high_school",
  desired_study_level: "bachelor",
  qualification_year: "",
  verification_method: "seat_number" as const,
  seat_number: "",
  national_id: "",
  result_check_method: "percentage" as const,
  tawjihi_percentage: undefined as number | undefined,
  tawjihi_total_score: undefined as number | undefined,
  isQualificationVerified: false,
  verificationSource: "pending_backend_api" as const,
  lockedQualificationFields: false,
};

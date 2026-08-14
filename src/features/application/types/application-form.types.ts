import type {
  BirthPlace,
  FatherStatus,
  GuardianProfession,
  GuardianRelationship,
  GuardianWorkplace,
} from "@/services/social-information.service";

export type QualificationData = {
  qualification_type: string;
  desired_study_level: string;
  qualification_year: string;
  verification_method: "seat_number" | "national_id";
  seat_number?: string;
  national_id?: string;
  result_check_method: "percentage" | "total_score";
  tawjihi_percentage?: number;
  tawjihi_total_score?: number;
  isQualificationVerified: boolean;
  verificationSource: "manual" | "ministry" | "pending_backend_api";
  lockedQualificationFields?: boolean;
};

export type AdmissionTypeData = {
  admissionType: string;
  studentType: string;
};

export type TawjihiData = {
  lastCertificate: string;
  studyProgram: string;
  studyYear: string;
  seatNumber: string;
  totalMarks: string;
  percentage: string;
  nationalId: string;
  firstNameAr?: string;
  fatherNameAr?: string;
  grandfatherNameAr?: string;
  familyNameAr?: string;
  gender?: "male" | "female";
  nationality?: string;
};

export type BasicPersonalData = {
  birthPlace: BirthPlace | string;
  birthCountry: string;
  birthDate: string;
  firstNameEn: string;
  fatherNameEn: string;
  grandfatherNameEn: string;
  lastNameEn: string;
};

export type GuardianData = {
  guardianRelationship: GuardianRelationship | string;
  guardianName: string;
  guardianNationalId: string;
  guardianWorkplace: GuardianWorkplace | string;
  fatherStatus: FatherStatus;
  fatherWorks: "yes" | "no";
  motherWorks: "yes" | "no";
  guardianJob: GuardianProfession | string;
  guardianPhone: string;
};

export type ContactData = {
  governorate: string;
  city: string;
  neighborhood: string;
  street: string;
  email: string;
  phone: string;
  mobile: string;
  phoneLandline?: string;
};

export type StudentPreferencesData = {
  preferences: (string | number)[];
};

export type StudentPhotoData = {
  photoUrl: string | null;
};

export type ApplicationDocument = {
  documentTypeId: string | number;
  uploadedDocumentId?: string | number;
  uploaded: boolean;
  pledge: boolean;
  fileName?: string;
  nameKey?: string;
};

export type ApplicationDocumentsData = {
  documents: ApplicationDocument[];
};

export type FinalConfirmationData = {
  confirmData: boolean;
  agreeTerms: boolean;
};

export type ApplicationWizardState = {
  qualificationData: QualificationData;
  admissionType: AdmissionTypeData;
  tawjihi: TawjihiData;
  basicData: BasicPersonalData;
  guardian: GuardianData;
  contact: ContactData;
  preferences: StudentPreferencesData;
  photo: StudentPhotoData;
  documents: ApplicationDocumentsData;
  confirmation: FinalConfirmationData;
};


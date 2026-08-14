import type { BackendApplicationStatus } from "./status-adapter";
import { normalizeStatus } from "./status-adapter";

export type BackendApplicationRaw = {
  id: string | number;
  application_number?: string;
  applicationNo?: string;
  code?: string;
  status?: string;
  admission_cycle_id?: string | number;
  admissionCycleId?: string | number;
  application_type_id?: string | number;
  applicationTypeId?: string | number;
  program_id?: string | number;
  programId?: string | number;
  submitted_at?: string;
  submittedAt?: string;
  created_at?: string;
  createdAt?: string;
  decision_reason?: string;
  rejectionReason?: string;
  student_notes?: string;
  notes?: string;
  university_number?: string;
  universityNumber?: string;
  applicant?: {
    id?: string | number;
    name?: string;
    first_name_ar?: string;
    father_name_ar?: string;
    family_name_ar?: string;
    national_id?: string;
    email?: string;
    phone?: string;
  };
  program?: {
    id?: string | number;
    name_ar?: string;
    name_en?: string;
    name?: string;
    department?: {
      name_ar?: string;
      name_en?: string;
      name?: string;
      faculty?: {
        name_ar?: string;
        name_en?: string;
        name?: string;
      };
    };
  };
  admission_cycle?: {
    id?: string | number;
    name?: string;
  };
  preferences?: Array<{
    id?: string | number;
    program_id?: string | number;
    programId?: string | number;
    order?: number;
    program?: {
      name_ar?: string;
      name_en?: string;
      name?: string;
    };
  }>;
};

export type StudentApplicationDetail = {
  id: string | number;
  applicationNo: string;
  status: BackendApplicationStatus;
  admissionCycleId?: string | number;
  applicationTypeId?: string | number;
  programId?: string | number;
  programName?: string;
  facultyName?: string;
  departmentName?: string;
  submittedAt?: string;
  createdAt?: string;
  rejectionReason?: string;
  studentNotes?: string;
  universityNumber?: string;
  applicantName?: string;
  applicantNationalId?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  selectedPrograms?: (string | number)[];
  academicInfo?: {
    branch?: string;
    average?: number;
    graduationYear?: string;
    school?: string;
  };
  personalInfo?: {
    firstName?: string;
    fatherName?: string;
    familyName?: string;
    nationalId?: string;
    birthDate?: string;
    gender?: string;
    nationality?: string;
  };
  preferences?: Array<{
    programId: string | number;
    programName?: string;
    order: number;
  }>;
};

export function adaptBackendApplication(
  raw: BackendApplicationRaw,
  locale: string = "ar"
): StudentApplicationDetail {
  const status = normalizeStatus(raw.status);

  const programName = raw.program
    ? locale === "ar"
      ? raw.program.name_ar || raw.program.name_en || raw.program.name || ""
      : raw.program.name_en || raw.program.name_ar || raw.program.name || ""
    : undefined;

  const departmentName = raw.program?.department
    ? locale === "ar"
      ? raw.program.department.name_ar || raw.program.department.name_en || raw.program.department.name || ""
      : raw.program.department.name_en || raw.program.department.name_ar || raw.program.department.name || ""
    : undefined;

  const facultyName = raw.program?.department?.faculty
    ? locale === "ar"
      ? raw.program.department.faculty.name_ar || raw.program.department.faculty.name_en || raw.program.department.faculty.name || ""
      : raw.program.department.faculty.name_en || raw.program.department.faculty.name_ar || raw.program.department.faculty.name || ""
    : undefined;

  const preferencesMapped = (raw.preferences || []).map((pref, idx) => ({
    programId: pref.program_id ?? pref.programId ?? pref.id ?? "",
    programName: pref.program
      ? locale === "ar"
        ? pref.program.name_ar || pref.program.name_en || pref.program.name
        : pref.program.name_en || pref.program.name_ar || pref.program.name
      : undefined,
    order: pref.order ?? idx + 1,
  }));

  const applicantName = raw.applicant
    ? raw.applicant.name ||
      [raw.applicant.first_name_ar, raw.applicant.father_name_ar, raw.applicant.family_name_ar]
        .filter(Boolean)
        .join(" ")
    : undefined;

  return {
    id: raw.id,
    applicationNo: raw.application_number || raw.applicationNo || raw.code || String(raw.id),
    status,
    admissionCycleId: raw.admission_cycle_id ?? raw.admissionCycleId,
    applicationTypeId: raw.application_type_id ?? raw.applicationTypeId,
    programId: raw.program_id ?? raw.programId ?? raw.program?.id,
    programName,
    facultyName,
    departmentName,
    submittedAt: raw.submitted_at ?? raw.submittedAt,
    createdAt: raw.created_at ?? raw.createdAt,
    rejectionReason: raw.decision_reason ?? raw.rejectionReason,
    studentNotes: raw.student_notes ?? raw.notes,
    universityNumber: raw.university_number ?? raw.universityNumber,
    applicantName,
    applicantNationalId: raw.applicant?.national_id,
    applicantEmail: raw.applicant?.email,
    applicantPhone: raw.applicant?.phone,
    preferences: preferencesMapped,
  };
}

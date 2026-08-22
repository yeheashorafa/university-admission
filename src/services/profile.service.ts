import { apiClient, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { SocialInformation } from "@/services/social-information.service";
import {
  normalizeStudentProfile,
  getStudentDisplayName,
  getStudentNationalId,
  getPersonalInformation,
  getSocialInformationFromProfile,
  hasTawjihiRecord,
} from "@/lib/adapters/student-profile-adapter";

export {
  normalizeStudentProfile,
  getStudentDisplayName,
  getStudentNationalId,
  getPersonalInformation,
  getSocialInformationFromProfile,
  hasTawjihiRecord,
};

export type PersonalInformation = {
  national_id?: string;
  first_name_ar?: string;
  father_name_ar?: string;
  grandfather_name_ar?: string;
  family_name_ar?: string;
  first_name_en?: string | null;
  father_name_en?: string | null;
  grandfather_name_en?: string | null;
  family_name_en?: string | null;
  gender?: "male" | "female";
  nationality?: string;
  date_of_birth?: string | null;
  place_of_birth?: string | null;
  official_address?: string | null;
};

export type StudentProfile = {
  id?: string | number;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  national_id?: string;
  city?: string;
  address?: string;
  profileCompletion?: number;
  personal_information?: PersonalInformation | null;
  social_information?: SocialInformation | null;
  addresses?: Record<string, unknown>;
  emergency_contacts?: Record<string, unknown>;
  secondary_school_record?: Record<string, unknown> | null;
  secondary_school_records?: Record<string, unknown>[];
  // PENDING_BACKEND_API: University number issue endpoint pending
  universityNumber?: string;
};

export function hasVerifiedTawjihiRecord(profile: StudentProfile | null | undefined): boolean {
  return hasTawjihiRecord(profile);
}

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  personal_information?: PersonalInformation;
  addresses?: Record<string, unknown>;
  emergency_contacts?: Record<string, unknown>;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
};

export async function getMyProfile(): Promise<StudentProfile> {
  const response = await apiClient.get<StudentProfile>(ENDPOINTS.student.profile);
  const resource = extractResource<unknown>(response.data);
  return normalizeStudentProfile(resource);
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<StudentProfile> {
  const response = await apiClient.put<StudentProfile>(
    ENDPOINTS.student.profile,
    payload
  );
  const resource = extractResource<unknown>(response.data);
  return normalizeStudentProfile(resource);
}

export async function changePassword(payload: {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post<{ success: boolean; message?: string }>(
    "/student/profile/password",
    payload
  );
  return response.data;
}
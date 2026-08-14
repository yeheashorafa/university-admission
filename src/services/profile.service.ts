import { apiClient, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type PersonalInformation = {
  national_id?: string;
  first_name_ar?: string;
  father_name_ar?: string;
  grandfather_name_ar?: string;
  family_name_ar?: string;
  gender?: "male" | "female";
  nationality?: string;
};

export type StudentProfile = {
  id?: string | number;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  city?: string;
  address?: string;
  profileCompletion?: number;
  personal_information?: PersonalInformation;
  addresses?: Record<string, unknown>;
  emergency_contacts?: Record<string, unknown>;
  // PENDING_BACKEND_API: University number issue endpoint pending
  universityNumber?: string;
};

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
  return extractResource<StudentProfile>(response.data);
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<StudentProfile> {
  const response = await apiClient.put<StudentProfile>(
    ENDPOINTS.student.profile,
    payload
  );
  return extractResource<StudentProfile>(response.data);
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
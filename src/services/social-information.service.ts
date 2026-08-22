import { apiClient, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type BirthPlace = "inside_palestine" | "outside_palestine";

export type GuardianRelationship =
  | "father"
  | "mother"
  | "brother"
  | "sister"
  | "paternal_uncle"
  | "maternal_uncle"
  | "grandfather"
  | "other";

export type GuardianProfession =
  | "government_employee"
  | "unrwa_employee"
  | "private_sector"
  | "merchant"
  | "craftsman"
  | "teacher"
  | "military"
  | "unemployed"
  | "retired"
  | "other";

export type GuardianWorkplace =
  | "ministry_of_health"
  | "ministry_of_education"
  | "ministry_of_interior"
  | "ministry_of_finance"
  | "ministry_of_social_affairs"
  | "ministry_of_awqaf"
  | "ministry_of_justice"
  | "ministry_of_public_works"
  | "ministry_of_agriculture"
  | "ministry_of_transportation"
  | "unrwa"
  | "private_sector"
  | "ngo"
  | "self_employed"
  | "other";

export type FatherStatus = "alive" | "deceased" | "abandoned";

export type SocialInformation = {
  birth_place?: BirthPlace;
  birth_date?: string;
  first_name_en?: string;
  father_name_en?: string;
  grandfather_name_en?: string;
  family_name_en?: string;
  guardian_name?: string;
  guardian_national_id?: string;
  guardian_relationship?: GuardianRelationship;
  guardian_profession?: GuardianProfession;
  guardian_workplace?: GuardianWorkplace;
  guardian_phone?: string;
  governorate?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  phone_landline?: string;
  father_status?: FatherStatus;
  father_is_working?: boolean;
  mother_is_working?: boolean;
};

export async function getSocialInformation(): Promise<SocialInformation> {
  const response = await apiClient.get<SocialInformation>(ENDPOINTS.student.socialInformation);
  return extractResource<SocialInformation>(response.data);
}

export async function updateSocialInformation(
  payload: Partial<SocialInformation>
): Promise<SocialInformation> {
  const response = await apiClient.put<SocialInformation>(
    ENDPOINTS.student.socialInformation,
    payload
  );
  return extractResource<SocialInformation>(response.data);
}

import { apiClient, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type SecondarySchoolRecord = {
  id?: string | number;
  student_school_id?: string;
  graduation_year?: number;
  average?: number;
  branch?: string | null;
  seat_number?: string | null;
  total_marks?: number | null;
  certificate_type?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UpdateSecondarySchoolRecordPayload = {
  student_school_id?: string;
  graduation_year?: number;
  average?: number;
  branch?: string | null;
  seat_number?: string | null;
  total_marks?: number | null;
  certificate_type?: string | null;
};

export async function getMySecondarySchoolRecord(): Promise<SecondarySchoolRecord | null> {
  const response = await apiClient.get(ENDPOINTS.student.secondarySchoolRecords);
  const resource = extractResource<SecondarySchoolRecord | SecondarySchoolRecord[] | null>(
    response.data
  );
  if (Array.isArray(resource)) {
    return resource[0] ?? null;
  }
  return resource ?? null;
}

export async function updateMySecondarySchoolRecord(
  payload: UpdateSecondarySchoolRecordPayload
): Promise<SecondarySchoolRecord> {
  const response = await apiClient.put(
    ENDPOINTS.student.secondarySchoolRecords,
    payload
  );
  return extractResource<SecondarySchoolRecord>(response.data);
}

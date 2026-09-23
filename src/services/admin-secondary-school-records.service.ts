import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type ImportSecondarySchoolRecordsResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export async function importSecondarySchoolRecords(
  file: File,
  graduationYear: number
): Promise<ImportSecondarySchoolRecordsResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("graduation_year", graduationYear.toString());

  const response = await apiClient.post<ImportSecondarySchoolRecordsResponse>(
    ENDPOINTS.admin.secondarySchoolRecordsImport,
    formData
  );
  return response.data;
}

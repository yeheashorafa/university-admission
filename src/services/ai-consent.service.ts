import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type StudentAiConsent = {
  granted: boolean;
  consent_version: string | null;
  granted_at: string | null;
  withdrawn_at: string | null;
  required_version: string;
};

export async function getStudentAiConsent(): Promise<StudentAiConsent> {
  const { data } = await apiClient.get<StudentAiConsent>(ENDPOINTS.student.aiConsent);

  if (typeof data?.required_version !== "string" || !data.required_version) {
    throw new Error("The required consent version is unavailable.");
  }

  return data;
}

export async function grantStudentAiConsent(requiredVersion: string): Promise<void> {
  await apiClient.post(ENDPOINTS.student.aiConsent, { consent_version: requiredVersion });
}

export async function withdrawStudentAiConsent(): Promise<void> {
  await apiClient.delete(ENDPOINTS.student.aiConsent);
}

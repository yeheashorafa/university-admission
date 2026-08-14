import { apiClient, extractResource } from "@/lib/api/client";
import type { PublicProgram } from "./public-catalog.service";

export type Program = PublicProgram;

export async function getProgramById(programId: string | number): Promise<PublicProgram> {
  const response = await apiClient.get<PublicProgram | { data: PublicProgram }>(
    `/public/programs/${programId}`
  );
  return extractResource<PublicProgram>(response.data);
}
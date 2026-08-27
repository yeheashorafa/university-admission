import { apiClient, extractArray, extractResource } from "@/lib/api/client";

export type AdminBranch = {
  id: string | number;
  name?: string;
  name_en?: string;
  name_ar?: string;
  is_active?: boolean;
};

export type AdminBranchPayload = {
  name_en: string;
  name_ar: string;
  is_active?: boolean;
};

const BASE = "/admin/branches";

export async function getAdminBranches(): Promise<AdminBranch[]> {
  const response = await apiClient.get<AdminBranch[] | { data: AdminBranch[] }>(BASE);
  return extractArray<AdminBranch>(response.data);
}

export async function createAdminBranch(payload: AdminBranchPayload): Promise<AdminBranch> {
  const response = await apiClient.post<AdminBranch | { data: AdminBranch }>(BASE, payload);
  return extractResource<AdminBranch>(response.data);
}

export async function updateAdminBranch(
  branchId: string | number,
  payload: Partial<AdminBranchPayload>
): Promise<AdminBranch> {
  const response = await apiClient.put<AdminBranch | { data: AdminBranch }>(
    `${BASE}/${branchId}`,
    payload
  );
  return extractResource<AdminBranch>(response.data);
}

export async function deleteAdminBranch(branchId: string | number): Promise<void> {
  await apiClient.delete(`${BASE}/${branchId}`);
}

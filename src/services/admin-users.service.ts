import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { normalizeAuthUser, type AuthUser, type UserRole } from "./auth.service";

export type AdminUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roles?: UserRole[];
};

export async function getAdminUsers(params?: {
  page?: number;
  search?: string;
  role?: UserRole;
  status?: string;
}): Promise<AuthUser[]> {
  const response = await apiClient.get<AuthUser[] | { data: AuthUser[] }>(
    ENDPOINTS.admin.users,
    { params }
  );
  const rawUsers = extractArray<Record<string, unknown>>(response.data);
  return rawUsers.map(normalizeAuthUser);
}

export async function createAdminUser(payload: AdminUserPayload): Promise<AuthUser> {
  const response = await apiClient.post<AuthUser | { data: AuthUser }>(
    ENDPOINTS.admin.users,
    payload
  );
  return extractResource<AuthUser>(response.data);
}

export async function updateAdminUser(
  userId: string | number,
  payload: Partial<AdminUserPayload>
): Promise<AuthUser> {
  const response = await apiClient.put<AuthUser | { data: AuthUser }>(
    ENDPOINTS.admin.userDetail(userId),
    payload
  );
  return extractResource<AuthUser>(response.data);
}

export async function deleteAdminUser(userId: string | number): Promise<void> {
  await apiClient.delete(ENDPOINTS.admin.userDetail(userId));
}
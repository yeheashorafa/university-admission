import { apiClient, extractArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { normalizeAuthUser, type AuthUser, type UserRole } from "./auth.service";

export type AdminUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
  is_active?: boolean;
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
  return rawUsers.map((u) => normalizeAuthUser(u));
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
  // The API update endpoint does not accept a password field; omit it to avoid 422s.
  const rest: Partial<AdminUserPayload> = { ...payload };
  delete rest.password;
  const response = await apiClient.put<AuthUser | { data: AuthUser }>(
    ENDPOINTS.admin.userDetail(userId),
    rest
  );
  return extractResource<AuthUser>(response.data);
}

export async function resetStaffPassword(id: string | number, password: string, confirmation: string, reason: string): Promise<void> {
  await apiClient.post(`${ENDPOINTS.admin.users}/${id}/reset-password`, {
    password,
    password_confirmation: confirmation,
    reason,
  });
}

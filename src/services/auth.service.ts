import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { UserRole } from "@/constants/roles";

export type { UserRole };

export type AuthUser = {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  is_verified?: boolean;
  verified?: boolean;
  email_verified_at?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export function isUserVerified(user: AuthUser | null | undefined): boolean | undefined {
  if (!user) return undefined;
  if (typeof user.is_verified === "boolean") return user.is_verified;
  if (typeof user.verified === "boolean") return user.verified;
  if (user.email_verified_at !== undefined && user.email_verified_at !== null) return true;
  if (user.email_verified_at === null) return false;
  return undefined;
}

export function extractRoleName(userRaw: Record<string, unknown> | null | undefined): UserRole {
  if (!userRaw) return "student";

  // Check role property
  if (typeof userRaw.role === "string") {
    return userRaw.role as UserRole;
  }
  if (
    userRaw.role &&
    typeof userRaw.role === "object" &&
    "name" in (userRaw.role as object) &&
    typeof (userRaw.role as { name: unknown }).name === "string"
  ) {
    return (userRaw.role as { name: string }).name as UserRole;
  }

  // Check roles array
  if (Array.isArray(userRaw.roles) && userRaw.roles.length > 0) {
    const firstRole = userRaw.roles[0];
    if (typeof firstRole === "string") {
      return firstRole as UserRole;
    }
    if (
      firstRole &&
      typeof firstRole === "object" &&
      "name" in (firstRole as object) &&
      typeof (firstRole as { name: unknown }).name === "string"
    ) {
      return (firstRole as { name: string }).name as UserRole;
    }
  }

  return "student";
}

export function normalizeAuthUser(rawUser: Record<string, unknown> | null | undefined): AuthUser {
  const roleName = extractRoleName(rawUser);
  const rawVerified = rawUser?.is_verified ?? rawUser?.verified;
  const is_verified =
    typeof rawVerified === "boolean"
      ? rawVerified
      : typeof rawUser?.email_verified_at !== "undefined"
      ? Boolean(rawUser?.email_verified_at)
      : undefined;

  const email_verified_at =
    typeof rawUser?.email_verified_at === "string"
      ? rawUser.email_verified_at
      : rawUser?.email_verified_at === null
      ? null
      : undefined;

  return {
    id: (rawUser?.id as string | number) ?? "",
    name:
      (rawUser?.name as string) ??
      (rawUser?.full_name as string) ??
      (rawUser?.fullName as string) ??
      "",
    email: (rawUser?.email as string) ?? "",
    role: roleName,
    phone: (rawUser?.phone as string) ?? "",
    avatar: (rawUser?.avatar as string) ?? "",
    is_verified,
    verified: is_verified,
    email_verified_at,
  };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post(ENDPOINTS.auth.login, payload);
  const dataPayload = response.data?.data ?? response.data;
  const token = dataPayload?.access_token || dataPayload?.token || "";
  const rawUser = dataPayload?.user ?? dataPayload;
  const user = normalizeAuthUser(rawUser);
  return { user, token };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post(ENDPOINTS.auth.register, payload);
  const dataPayload = response.data?.data ?? response.data;
  const token = dataPayload?.access_token || dataPayload?.token || "";
  const rawUser = dataPayload?.user ?? dataPayload;
  const user = normalizeAuthUser(rawUser);
  return { user, token };
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get(ENDPOINTS.auth.me);
  const dataPayload = response.data?.data ?? response.data;
  const rawUser = dataPayload?.user ?? dataPayload;
  return normalizeAuthUser(rawUser);
}

export async function refreshToken(): Promise<string> {
  const response = await apiClient.post(ENDPOINTS.auth.refresh);
  const dataPayload = response.data.data;
  return dataPayload.access_token || dataPayload.token || "";
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(ENDPOINTS.auth.logout);
  } catch {
    // ignore logout errors to ensure client cleanup
  }
}

export async function forgotPassword(email: string) {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(payload: {
  token: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}) {
  const response = await apiClient.post("/auth/reset-password", payload);
  return response.data;
}

export async function verifyOtp(payload: { email: string; otp: string }) {
  const response = await apiClient.post("/auth/verify-otp", payload);
  return response.data;
}
/**
 * SECURITY NOTE:
 * Current JWT storage uses localStorage for client-side API requests.
 * In a production environment, JWT access and refresh tokens should ideally be migrated
 * to httpOnly, SameSite=Strict cookies once supported by backend authentication endpoints.
 */

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

const KEYS_TO_CLEAR = [
  ACCESS_TOKEN_KEY,
  USER_KEY,
  "auth-storage",
  "admission-auth",
  "demo-user",
  "demo-auth",
  "token",
];

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-token-change"));
  window.dispatchEvent(new Event("auth-storage-change"));
}

export function removeAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event("auth-token-change"));
  window.dispatchEvent(new Event("auth-storage-change"));
}

export function getStoredUser<T = unknown>(): T | null {
  if (typeof window === "undefined") return null;
  const token = getAccessToken();
  if (!token) {
    localStorage.removeItem(USER_KEY);
    return null;
  }
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-user-change"));
  window.dispatchEvent(new Event("auth-storage-change"));
}

export function removeStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth-user-change"));
  window.dispatchEvent(new Event("auth-storage-change"));
}

export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  KEYS_TO_CLEAR.forEach((key) => {
    localStorage.removeItem(key);
  });
  window.dispatchEvent(new Event("auth-token-change"));
  window.dispatchEvent(new Event("auth-user-change"));
  window.dispatchEvent(new Event("auth-storage-change"));
}

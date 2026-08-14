"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { AuthUser } from "@/services/auth.service";
import { clearAuthStorage, getAccessToken, getStoredUser } from "@/lib/api/auth-token";

type StoredAuth = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  role: AuthUser["role"] | null;
  isHydrated: boolean;
};

const SERVER_AUTH_SNAPSHOT = "__server__";

function subscribeToAuthStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("auth-storage-change", callback);
  window.addEventListener("auth-token-change", callback);
  window.addEventListener("auth-user-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("auth-storage-change", callback);
    window.removeEventListener("auth-token-change", callback);
    window.removeEventListener("auth-user-change", callback);
  };
}

function getAuthStorageSnapshot() {
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const storageState = localStorage.getItem("auth-storage") ?? "";
  const userState = localStorage.getItem("user") ?? "";
  return `${token ?? ""}:${userState}:${storageState}`;
}

function getServerAuthStorageSnapshot() {
  return SERVER_AUTH_SNAPSHOT;
}

function parseAuthStorage(snapshot: string): StoredAuth {
  if (snapshot === SERVER_AUTH_SNAPSHOT) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      isHydrated: false,
    };
  }

  if (!snapshot) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      isHydrated: true,
    };
  }

  try {
    let token: string | null = getAccessToken();
    let user: AuthUser | null = getStoredUser<AuthUser>();

    const storageState = localStorage.getItem("auth-storage");
    if (storageState) {
      const parsed = JSON.parse(storageState) as {
        state?: {
          user?: AuthUser | null;
          token?: string | null;
        };
      };
      if (!user) {
        user = parsed.state?.user ?? null;
      }
      if (!token) {
        token = parsed.state?.token ?? null;
      }
    }

    if (!user || !token) {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        role: null,
        isHydrated: true,
      };
    }

    return {
      user,
      token,
      isAuthenticated: true,
      role: user.role ?? null,
      isHydrated: true,
    };
  } catch {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,
      isHydrated: true,
    };
  }
}

export function useCurrentAuth() {
  const snapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthStorageSnapshot,
    getServerAuthStorageSnapshot
  );

  return useMemo(() => parseAuthStorage(snapshot), [snapshot]);
}

export function clearCurrentAuth() {
  clearAuthStorage();
}
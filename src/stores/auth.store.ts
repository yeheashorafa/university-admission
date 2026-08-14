import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  register as registerService,
  refreshToken as refreshService,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/services/auth.service";
import {
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setStoredUser,
  clearAuthStorage,
} from "@/lib/api/auth-token";
import { extractApiError } from "@/lib/api/api-error";
import type { UserRole } from "@/constants/roles";

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  status: AuthStatus;
  hasHydrated: boolean;

  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;

  setHasHydrated: (value: boolean) => void;
  setAuth: (payload: { user: AuthUser; token: string }) => void;
  clearAuth: () => void;

  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<AuthUser | null>;
  refreshSession: () => Promise<string | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      status: "guest",
      hasHydrated: false,

      get isAuthenticated() {
        return Boolean(get().user && get().token);
      },

      get isLoading() {
        return get().status === "loading";
      },

      get role() {
        return get().user?.role ?? null;
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      setAuth: ({ user, token }) => {
        setAccessToken(token);
        setStoredUser(user);

        set({
          user,
          token,
          status: "authenticated",
        });
      },

      clearAuth: () => {
        clearAuthStorage();

        set({
          user: null,
          token: null,
          status: "guest",
        });
      },

      login: async (payload) => {
        set({ status: "loading" });

        try {
          const authResponse = await loginService(payload);

          setAccessToken(authResponse.token);
          setStoredUser(authResponse.user);

          set({
            user: authResponse.user,
            token: authResponse.token,
            status: "authenticated",
          });

          return authResponse.user;
        } catch (error) {
          clearAuthStorage();

          set({
            user: null,
            token: null,
            status: "guest",
          });

          throw error;
        }
      },

      register: async (payload) => {
        set({ status: "loading" });

        try {
          const authResponse = await registerService(payload);

          setAccessToken(authResponse.token);
          setStoredUser(authResponse.user);

          set({
            user: authResponse.user,
            token: authResponse.token,
            status: "authenticated",
          });

          return authResponse.user;
        } catch (error) {
          clearAuthStorage();

          set({
            user: null,
            token: null,
            status: "guest",
          });

          throw error;
        }
      },

      logout: async () => {
        set({ status: "loading" });

        try {
          await logoutService();
        } finally {
          clearAuthStorage();

          set({
            user: null,
            token: null,
            status: "guest",
          });
        }
      },

      fetchCurrentUser: async () => {
        const token = get().token || getAccessToken();

        if (!token) {
          clearAuthStorage();

          set({
            user: null,
            token: null,
            status: "guest",
          });

          return null;
        }

        set({ status: "loading" });

        try {
          const user = await getCurrentUser();

          set({
            user,
            status: "authenticated",
          });

          setStoredUser(user);

          return user;
        } catch (error) {
          const apiError = extractApiError(error);

          if (apiError.status === 401) {
            clearAuthStorage();

            set({
              user: null,
              token: null,
              status: "guest",
            });

            return null;
          }

          if (get().user && get().token) {
            set({ status: "authenticated" });
            return get().user;
          }

          return null;
        }
      },

      refreshSession: async () => {
        try {
          const newToken = await refreshService();
          if (newToken) {
            setAccessToken(newToken);
            set({ token: newToken });
            return newToken;
          }
          throw new Error("No token returned");
        } catch {
          get().clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return null;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const storedToken = getAccessToken();
        const storedUser = getStoredUser<AuthUser>();

        const effectiveToken = state.token || storedToken;
        const effectiveUser = state.user || storedUser;

        if (effectiveToken && effectiveUser) {
          state.setAuth({
            user: effectiveUser,
            token: effectiveToken,
          });
          // Restore session from /auth/me in background
          state.fetchCurrentUser().catch(() => {});
        } else {
          state.clearAuth();
        }

        state.setHasHydrated(true);
      },
    }
  )
);
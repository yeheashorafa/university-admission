import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, setAccessToken, clearAuthStorage } from "./auth-token";
import { extractApiError, isVerificationError, ApiError } from "./api-error";
import { extractResource } from "./response";
import { ENDPOINTS } from "./endpoints";
import { isAccountVerificationBypassed } from "../auth-verification";
import { getLogoutInProgress } from "../auth/logout-state";

const NO_REFRESH_ENDPOINTS = /^\/auth\/(login|register|refresh|send-otp|verify-otp)(\/|$)/;

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(token: string | null, error?: unknown): void {
  pendingQueue.forEach((entry) => {
    if (token) entry.resolve(token);
    else entry.reject(error);
  });
  pendingQueue = [];
}

async function refreshAuthToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const response = await apiClient.post(ENDPOINTS.auth.refresh);
    const dataPayload = response.data?.data ?? response.data;
    const token = dataPayload?.access_token || dataPayload?.token || "";
    if (!token) throw new ApiError("Refresh response did not include a token.");
    setAccessToken(token);
    flushQueue(token);
    return token;
  } catch (error) {
    flushQueue(null, error);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

function redirectTo(path: string): void {
  if (typeof window === "undefined") return;
  const segments = window.location.pathname.split("/").filter(Boolean);
  const hasLocale =
    segments.length > 0 && (segments[0] === "ar" || segments[0] === "en");
  const localePrefix = hasLocale ? `/${segments[0]}` : "";
  window.location.href = `${localePrefix}${path}`;
}

export function getNormalizedBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "https://university-admission-backend.onrender.com/api/v1";
  let cleanUrl = envUrl.replace(/\/+$/, "");

  while (cleanUrl.endsWith("/api/v1/api/v1")) {
    cleanUrl = cleanUrl.slice(0, -7);
  }

  if (cleanUrl.endsWith("/api/v1")) {
    return cleanUrl;
  }
  if (cleanUrl.endsWith("/api")) {
    return `${cleanUrl}/v1`;
  }
  if (cleanUrl.endsWith("/v1")) {
    cleanUrl = cleanUrl.slice(0, -3).replace(/\/+$/, "");
    if (cleanUrl.endsWith("/api")) {
      return `${cleanUrl}/v1`;
    }
    return `${cleanUrl}/api/v1`;
  }
  return `${cleanUrl}/api/v1`;
}

export const API_BASE_URL = getNormalizedBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 30000,
});

const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/applications",
  "/new-application",
  "/documents",
  "/notifications",
  "/status",
  "/profile",
  "/admin",
  "/payment",
  "/social-information",
];

export function isProtectedRoute(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && (segments[0] === "ar" || segments[0] === "en")) {
    segments.shift();
  }
  const cleanPath = "/" + segments.join("/");

  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
  );
}


apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (
        config.headers &&
        "delete" in config.headers &&
        typeof (config.headers as Record<string, unknown>).delete === "function"
      ) {
        (config.headers as { delete: (name: string) => void }).delete("Content-Type");
        (config.headers as { delete: (name: string) => void }).delete("content-type");
      } else if (config.headers) {
        delete (config.headers as Record<string, unknown>)["Content-Type"];
        delete (config.headers as Record<string, unknown>)["content-type"];
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(extractApiError(error));
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !NO_REFRESH_ENDPOINTS.test(requestUrl)
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAuthToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — fall through to the auth-clearing logic below.
      }
    }

    if (typeof window !== "undefined") {
      const apiError = extractApiError(error);
      const currentPath = window.location.pathname;
      const isAuthOrOtp = NO_REFRESH_ENDPOINTS.test(requestUrl);
      const isLogoutRequest = requestUrl.includes("/auth/logout");
      const alreadyOnAuthPage =
        currentPath.includes("/login") || currentPath.includes("/unauthorized");

      if (isLogoutRequest || getLogoutInProgress()) {
        return Promise.reject(extractApiError(error));
      }

      if (
        status === 403 &&
        isVerificationError(apiError) &&
        !isAccountVerificationBypassed() &&
        !alreadyOnAuthPage
      ) {
        redirectTo("/verify-otp?reason=verification");
      } else if (
        status === 403 &&
        isVerificationError(apiError) &&
        isAccountVerificationBypassed()
      ) {
        // Temporary bypass mode: keep session and let UI handle the error.
        return Promise.reject(extractApiError(error));
      } else if (
        status === 401 &&
        !isAuthOrOtp &&
        isProtectedRoute(currentPath) &&
        !alreadyOnAuthPage
      ) {
        clearAuthStorage();
        redirectTo("/login?reason=session");
      } else if (
        status === 403 &&
        isProtectedRoute(currentPath) &&
        !alreadyOnAuthPage
      ) {
        const method = originalRequest?.method?.toLowerCase();
        const isMutation = method && method !== "get";

        if (isMutation) {
          return Promise.reject(extractApiError(error));
        }

        redirectTo("/unauthorized");
      }
    }

    return Promise.reject(extractApiError(error));
  }
);

export { extractArray, extractResource } from "./response";

export function unwrapResourceResponse<T>(responseData: unknown): T {
  return extractResource<T>(responseData);
}

export function unwrapRootResponse<T>(responseData: unknown): T {
  return responseData as T;
}

export function unwrapMaybeResource<T>(responseData: unknown): T {
  return extractResource<T>(responseData);
}

export type LaravelPaginatedResponse<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type ApiStandardResponse<T> = {
  success?: boolean;
  message?: string;
  data: T;
};


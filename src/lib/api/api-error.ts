import { AxiosError } from "axios";

export type ValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  public status?: number;
  public errors?: ValidationErrors;
  public data?: unknown;

  constructor(
    message: string,
    options?: { status?: number; errors?: ValidationErrors; data?: unknown }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.errors = options?.errors;
    this.data = options?.data;

    // Restore prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function extractApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const responseData = error.response?.data as
      | { message?: string; errors?: ValidationErrors }
      | undefined;

    let message =
      responseData?.message ||
      error.message ||
      "An unexpected error occurred.";

    if (status === 401) {
      message = responseData?.message || "Unauthenticated session. Please log in again.";
    } else if (status === 403) {
      const serverMsg = responseData?.message || "";
      const isVerificationMsg =
        serverMsg.toLowerCase().includes("verify") ||
        serverMsg.toLowerCase().includes("unverified") ||
        serverMsg.includes("تفعيل");

      if (isVerificationMsg) {
        const isAr =
          typeof window !== "undefined" &&
          (window.location.pathname.startsWith("/ar") ||
            document.documentElement.lang === "ar");
        message = isAr
          ? "يرجى تفعيل حسابك قبل المتابعة."
          : "Please verify your account before continuing.";
      } else {
        message = serverMsg || "You do not have permission to perform this action.";
      }
    } else if (status === 404) {
      message = responseData?.message || "Requested resource was not found.";
    } else if (status === 422) {
      message = responseData?.message || "Validation failed. Please check your inputs.";
    }

    return new ApiError(message, {
      status,
      errors: responseData?.errors,
      data: error.response?.data,
    });
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("An unknown network error occurred.");
}

export function isVerificationError(error: unknown): boolean {
  const apiError = extractApiError(error);
  if (apiError.status === 403) return true;
  const msg = (apiError.message || "").toLowerCase();
  return (
    msg.includes("verify") ||
    msg.includes("unverified") ||
    msg.includes("tfeil") ||
    msg.includes("تفعيل") ||
    msg.includes("إثبات")
  );
}

export function getApiErrorMessage(error: unknown): string {
  return extractApiError(error).message;
}

export function getApiValidationErrors(error: unknown): ValidationErrors | undefined {
  return extractApiError(error).errors;
}

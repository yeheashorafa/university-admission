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
      message = responseData?.message || "You do not have permission to perform this action.";
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

export function getApiErrorMessage(error: unknown): string {
  return extractApiError(error).message;
}

export function getApiValidationErrors(error: unknown): ValidationErrors | undefined {
  return extractApiError(error).errors;
}

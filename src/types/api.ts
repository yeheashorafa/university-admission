export type ApiSuccessResponse<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

export type ApiResponse<T> = ApiSuccessResponse<T>;

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
};

export type WrappedResponse<T> = {
  data: T;
};

export type AuthPayload = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string | number;
    name: string;
    email: string;
    phone?: string;
    role: string | { name: string; guard_name?: string };
    roles?: (string | { name: string; guard_name?: string })[];
    avatar?: string;
  };
};

export type AuthResponse = WrappedResponse<AuthPayload>;

export type MeResponse = WrappedResponse<AuthPayload["user"]>;

export type DocumentUploadResponse = {
  id: string | number;
  document_type_id?: string | number;
  title: string;
  notes?: string;
  fileUrl?: string;
} | {
  data: {
    id: string | number;
    document_type_id?: string | number;
    title: string;
    notes?: string;
    fileUrl?: string;
  };
};
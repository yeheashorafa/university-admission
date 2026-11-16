import { extractApiError } from "@/lib/api/api-error";
import { apiClient, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

export const aiProviderTypes = ["anthropic", "gemini", "nvidia"] as const;
export type AiProviderType = (typeof aiProviderTypes)[number];

export type AiProviderPayload = {
  label: string;
  provider: AiProviderType;
  model: string | null;
  timeout_seconds: number;
  is_enabled: boolean;
  api_key?: string;
};

export const aiProviderFields = ["label", "provider", "model", "timeout_seconds", "is_enabled", "api_key"] as const;
export type AiProviderField = (typeof aiProviderFields)[number];

const resultCodes = [
  "ok", "provider_untested", "provider_revision_stale", "provider_disabled",
  "provider_key_missing", "provider_active", "provider_error", "provider_missing",
  "configuration_missing", "timeout", "rate_limited", "conflict", "unexpected",
] as const;
export type AiProviderCode = (typeof resultCodes)[number];

export type AiProvider = Omit<AiProviderPayload, "api_key"> & {
  id: number;
  has_credentials: boolean;
  config_revision: number;
  tested_revision: number | null;
  last_test_status: "success" | "failed" | null;
  last_test_code: AiProviderCode | null;
  tested_at: string | null;
};

export type AiProviderList = { active_provider_id: number | null; providers: AiProvider[] };
export type AiProviderProbe = {
  status: "success" | "failed";
  code: AiProviderCode;
  latency_ms: number;
  tested_at: string;
  config_revision: number;
};

function safeCode(value: unknown): AiProviderCode {
  return resultCodes.find((code) => code === value) ?? "unexpected";
}

export class AiProviderRequestError extends Error {
  constructor(readonly code: AiProviderCode, readonly fields: AiProviderField[]) {
    super(code);
    this.name = "AiProviderRequestError";
  }
}

async function safeRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    const { status, errors } = extractApiError(error);
    const reason = safeCode(errors?.reason_code);
    const code = status === 429 ? "rate_limited" : status === 409 && reason === "unexpected" ? "conflict" : reason;
    const fields = aiProviderFields.filter((field) => Array.isArray(errors?.[field]) && errors[field].length > 0);
    throw new AiProviderRequestError(code, fields);
  }
}

function toProvider({
  id, label, provider, model, timeout_seconds, is_enabled, has_credentials,
  config_revision, tested_revision, last_test_status, last_test_code, tested_at,
}: AiProvider): AiProvider {
  return {
    id, label, provider, model, timeout_seconds, is_enabled, has_credentials,
    config_revision, tested_revision, last_test_status, tested_at,
    last_test_code: last_test_code === null ? null : safeCode(last_test_code),
  };
}

export function getAiProviders(): Promise<AiProviderList> {
  return safeRequest(async () => {
    const { data } = await apiClient.get(ENDPOINTS.admin.aiProviders);
    const result = extractResource<AiProviderList>(data);
    return { active_provider_id: result.active_provider_id, providers: result.providers.map(toProvider) };
  });
}

export function createAiProvider(payload: AiProviderPayload): Promise<AiProvider> {
  return safeRequest(async () => {
    const { data } = await apiClient.post(ENDPOINTS.admin.aiProviders, payload);
    return toProvider(extractResource<AiProvider>(data));
  });
}

export function updateAiProvider(id: number, payload: AiProviderPayload): Promise<AiProvider> {
  const { api_key, ...settings } = payload;
  return safeRequest(async () => {
    const { data } = await apiClient.patch(ENDPOINTS.admin.aiProvider(id), api_key?.trim() ? payload : settings);
    return toProvider(extractResource<AiProvider>(data));
  });
}

export function testAiProvider(id: number): Promise<AiProviderProbe> {
  return safeRequest(async () => {
    const { data } = await apiClient.post<AiProviderProbe>(`${ENDPOINTS.admin.aiProvider(id)}/test`);
    const { status, code, latency_ms, tested_at, config_revision } = data;
    return { status, code: safeCode(code), latency_ms, tested_at, config_revision };
  });
}

export function activateAiProvider(id: number): Promise<void> {
  return safeRequest(async () => { await apiClient.post(`${ENDPOINTS.admin.aiProvider(id)}/activate`); });
}

export function deleteAiProvider(id: number): Promise<void> {
  return safeRequest(async () => { await apiClient.delete(ENDPOINTS.admin.aiProvider(id)); });
}

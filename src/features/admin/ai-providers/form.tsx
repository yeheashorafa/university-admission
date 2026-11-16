"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  AiProviderRequestError, aiProviderTypes, type AiProvider, type AiProviderField, type AiProviderPayload,
} from "@/services/admin-ai-providers.service";

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground";

function Field({ name, label, error, children }: {
  name: AiProviderField;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={`provider-${name}`} className="block text-sm font-semibold">{label}</label>
      {children}
      {error && <p id={`provider-${name}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function takeAiProviderKey(input: Pick<HTMLInputElement, "value">): string | undefined {
  const key = input.value.trim();
  input.value = "";
  return key || undefined;
}

export function AiProviderForm({ provider, active, pending, labels, onCancel, onSave }: {
  provider?: AiProvider;
  active: boolean;
  pending: boolean;
  labels: string[];
  onCancel: () => void;
  onSave: (payload: AiProviderPayload) => Promise<unknown>;
}) {
  const t = useTranslations("adminAiProviders");
  const keyInput = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<AiProviderField[]>([]);
  const [saveError, setSaveError] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const apiKey = keyInput.current ? takeAiProviderKey(keyInput.current) : undefined;
    const formData = new FormData(event.currentTarget);
    const label = String(formData.get("label") ?? "").trim();
    const type = aiProviderTypes.find((value) => value === formData.get("provider"));
    const model = String(formData.get("model") ?? "").trim();
    const timeout = Number(formData.get("timeout_seconds"));
    const invalid: AiProviderField[] = [];
    if (!label || label.length > 255 || labels.includes(label)) invalid.push("label");
    if (!type) invalid.push("provider");
    if (model.length > 255) invalid.push("model");
    if (!Number.isInteger(timeout) || timeout < 10 || timeout > 300) invalid.push("timeout_seconds");
    if (apiKey && apiKey.length > 4096) invalid.push("api_key");

    setSaveError(false);
    setErrors(invalid);
    if (invalid.length || !type) return;

    try {
      await onSave({
        label, provider: type, model: model || null, timeout_seconds: timeout,
        is_enabled: formData.has("is_enabled"),
        ...(apiKey ? { api_key: apiKey } : {}),
      });
    } catch (error) {
      if (error instanceof AiProviderRequestError && error.fields.length) {
        setErrors(error.fields);
      } else {
        setSaveError(true);
      }
    }
  }

  const errorFor = (name: AiProviderField) => errors.includes(name) ? t(`validation.${name}`) : undefined;
  const fieldAttrs = (name: AiProviderField) => ({
    id: `provider-${name}`, name,
    "aria-invalid": errors.includes(name),
    "aria-describedby": errors.includes(name) ? `provider-${name}-error` : undefined,
  });

  return (
    <section aria-labelledby="ai-provider-form-title" className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <h2 id="ai-provider-form-title" className="text-lg font-semibold">{t(provider ? "editTitle" : "createTitle")}</h2>
      {active && <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">{t("deactivateWarning")}</p>}
      <form noValidate onSubmit={(event) => void submit(event)} className="space-y-4">
        <fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
          <Field name="label" label={t("label")} error={errorFor("label")}>
            <input {...fieldAttrs("label")} required maxLength={255} className={inputClass} defaultValue={provider?.label} />
          </Field>
          <Field name="provider" label={t("provider")} error={errorFor("provider")}>
            <select {...fieldAttrs("provider")} className={inputClass} defaultValue={provider?.provider ?? "anthropic"}>
              {aiProviderTypes.map((type) => <option key={type} value={type}>{t(`types.${type}`)}</option>)}
            </select>
          </Field>
          <Field name="model" label={t("model")} error={errorFor("model")}>
            <input {...fieldAttrs("model")} maxLength={255} className={inputClass} defaultValue={provider?.model ?? ""} />
          </Field>
          <Field name="timeout_seconds" label={t("timeout")} error={errorFor("timeout_seconds")}>
            <input {...fieldAttrs("timeout_seconds")} type="number" min={10} max={300} step={1} required className={inputClass} defaultValue={provider?.timeout_seconds ?? 90} />
          </Field>
          <Field name="api_key" label={t("key")} error={errorFor("api_key")}>
            <input {...fieldAttrs("api_key")} ref={keyInput} type="password" autoComplete="new-password" maxLength={4096} className={inputClass} />
            {provider?.has_credentials && <p className="text-xs text-muted-foreground">{t("keepKey")}</p>}
          </Field>
          <Field name="is_enabled" label={t("enabled")} error={errorFor("is_enabled")}>
            <input {...fieldAttrs("is_enabled")} type="checkbox" role="switch" defaultChecked={provider?.is_enabled ?? true} className="size-5 accent-primary" />
          </Field>
        </fieldset>

        {saveError && <p role="alert" className="text-sm text-destructive">{t("codes.unexpected")}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {t(pending ? "saving" : "save")}
          </button>
          <button type="button" onClick={onCancel} disabled={pending} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-50">{t("cancel")}</button>
        </div>
      </form>
    </section>
  );
}

"use client";

import { useId, useState } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Swal from "sweetalert2";
import {
  useActivateAiProviderMutation, useDeleteAiProviderMutation, useTestAiProviderMutation,
} from "@/hooks/queries/use-admin-ai-providers-queries";
import { AiProviderRequestError, type AiProvider, type AiProviderCode, type AiProviderProbe } from "@/services/admin-ai-providers.service";

function activationBlock(provider: AiProvider, active: boolean): AiProviderCode | "alreadyActive" | null {
  if (active) return "alreadyActive";
  if (!provider.is_enabled) return "provider_disabled";
  if (!provider.has_credentials) return "provider_key_missing";
  if (provider.last_test_status !== "success") return "provider_untested";
  if (provider.tested_revision !== provider.config_revision) return "provider_revision_stale";
  return null;
}

export function AiProviderRowActions({ provider, active }: { provider: AiProvider; active: boolean }) {
  const t = useTranslations("adminAiProviders");
  const locale = useLocale();
  const format = useFormatter();
  const noteId = useId();
  const probe = useTestAiProviderMutation();
  const activate = useActivateAiProviderMutation();
  const remove = useDeleteAiProviderMutation();
  const [result, setResult] = useState<AiProviderProbe | null>(null);
  const [error, setError] = useState<AiProviderCode | null>(null);
  const blocked = activationBlock(provider, active);
  const reason = blocked === "alreadyActive" ? t("alreadyActive") : blocked ? t(`codes.${blocked}`) : undefined;
  const deleteReason = active ? t("codes.provider_active") : undefined;
  const busy = probe.isPending || activate.isPending || remove.isPending;
  const buttonClass = "rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted disabled:opacity-50";

  async function runProbe() {
    setResult(null);
    setError(null);
    try {
      setResult(await probe.mutateAsync(provider.id));
    } catch (failure) {
      setError(failure instanceof AiProviderRequestError ? failure.code : "unexpected");
    }
  }

  async function confirmAction(action: "activate" | "delete") {
    const deleting = action === "delete";
    const confirmation = await Swal.fire({
      titleText: t(deleting ? "deleteTitle" : "activateTitle", { label: provider.label }),
      text: t(deleting ? "deleteConfirm" : "activateConfirm"),
      confirmButtonText: t(action),
      cancelButtonText: t("cancel"),
      showCancelButton: true,
      focusCancel: true,
      didOpen: (popup) => { popup.dir = locale === "ar" ? "rtl" : "ltr"; },
    });
    if (!confirmation.isConfirmed) return;

    setError(null);
    try {
      await (deleting ? remove : activate).mutateAsync(provider.id);
    } catch (failure) {
      setError(failure instanceof AiProviderRequestError ? failure.code : "unexpected");
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} disabled={busy} onClick={() => void runProbe()}>
          {t(probe.isPending ? "testing" : "test")}
        </button>
        <button type="button" className={buttonClass} disabled={busy || blocked !== null} aria-describedby={reason ? noteId : undefined}
          onClick={() => void confirmAction("activate")}>
          {t(activate.isPending ? "activating" : "activate")}
        </button>
        <span title={deleteReason} tabIndex={active ? 0 : undefined} aria-label={deleteReason}>
          <button type="button" className={buttonClass} disabled={busy || active} onClick={() => void confirmAction("delete")}>
            {t(remove.isPending ? "deleting" : "delete")}
          </button>
        </span>
      </div>
      {reason && <p id={noteId} className="text-xs text-muted-foreground">{reason}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{t(`codes.${error}`)}</p>}
      {result && result.config_revision === provider.config_revision && (
        <p role="status" className="text-xs text-muted-foreground">
          {t("testSummary", { status: t(`status.${result.status}`), message: t(`codes.${result.code}`), latency: result.latency_ms })}
          {" "}
          <time dateTime={result.tested_at}>
            {format.dateTime(new Date(result.tested_at), { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })}
          </time>
        </p>
      )}
    </div>
  );
}

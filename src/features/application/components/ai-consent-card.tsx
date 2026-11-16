"use client";

import { useId } from "react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import Swal from "sweetalert2";
import type { useStudentAiConsent } from "@/hooks/queries/use-ai-consent-queries";

type Consent = ReturnType<typeof useStudentAiConsent>;

function isCurrentConsent({ query }: Consent): boolean {
  const data = query.data;
  return Boolean(query.isSuccess && data?.granted && data.consent_version === data.required_version);
}

function isSaving({ grant, withdraw }: Consent): boolean {
  return grant.isPending || withdraw.isPending;
}

export function canUploadWithAiConsent(consent: Consent): boolean {
  return consent.enabled && consent.query.fetchStatus === "idle" && isCurrentConsent(consent) && !isSaving(consent);
}

export function AiConsentCard({ consent }: { consent: Consent }) {
  const t = useTranslations("studentAiConsent");
  const locale = useLocale();
  const format = useFormatter();
  const headingId = useId();
  const { query, grant, withdraw } = consent;
  const data = query.data;
  const current = isCurrentConsent(consent);
  const saving = isSaving(consent);
  const buttonClass = "rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-50";

  async function confirmWithdrawal() {
    const result = await Swal.fire({
      title: t("withdraw"),
      text: t("withdrawConfirmation"),
      showCancelButton: true,
      confirmButtonText: t("withdraw"),
      cancelButtonText: t("cancel"),
      focusCancel: true,
      didOpen: (popup) => { popup.dir = locale === "ar" ? "rtl" : "ltr"; },
    });

    if (result.isConfirmed) {
      grant.reset();
      withdraw.mutate();
    }
  }

  return (
    <section aria-labelledby={headingId} className="space-y-3 rounded-2xl border border-border bg-card p-5 text-start">
      <h4 id={headingId} className="font-semibold text-foreground">{t("title")}</h4>

      {query.isPending ? (
        <p role="status" className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : query.isError ? (
        <>
          <p role="alert" className="text-sm text-destructive">{t("loadError")}</p>
          <button type="button" className={buttonClass} disabled={query.isFetching}
            onClick={() => void query.refetch()}>
            {t("retry")}
          </button>
        </>
      ) : current ? (
        <>
          <p className="text-sm text-muted-foreground">
            {data?.granted_at
              ? t("grantedOn", { date: format.dateTime(new Date(data.granted_at), { dateStyle: "medium", timeZone: "UTC" }) })
              : t("granted")}
          </p>
          <button type="button" className={buttonClass} disabled={saving}
            onClick={() => void confirmWithdrawal()}>
            {t("withdraw")}
          </button>
        </>
      ) : data ? (
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">{t("text")}</p>
          {data.granted && <p className="text-sm font-medium">{t("versionChanged")}</p>}
          <button type="button" className={buttonClass} disabled={saving || query.isFetching}
            onClick={() => { withdraw.reset(); grant.mutate(data.required_version); }}>
            {t("agree")}
          </button>
        </>
      ) : null}

      {saving && <p role="status" className="text-sm text-muted-foreground">{t("saving")}</p>}
      {(grant.isError || withdraw.isError) && <p role="alert" className="text-sm text-destructive">{t("saveError")}</p>}
      {!canUploadWithAiConsent(consent) && <p className="text-sm text-muted-foreground">{t("uploadDisabled")}</p>}
    </section>
  );
}

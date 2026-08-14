"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useMyProfileQuery } from "@/hooks/queries/use-profile-queries";

export function AccountSecurityCard() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: profile } = useMyProfileQuery();

  const isEmailVerified = Boolean(profile?.email);
  const isPhoneVerified = Boolean(profile?.phone);

  const lastLoginDisplay = isAr ? "غير متوفر" : "N/A";
  const accountCreatedDisplay = isAr ? "غير متوفر" : "N/A";

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-primary">
        <ShieldCheck className="size-6 text-secondary" />
        {t("accountSecurity")}
      </h2>

      <div className="mb-5 space-y-3">
        <SecurityStatus
          label={t("emailVerified")}
          checked={isEmailVerified}
        />

        <SecurityStatus
          label={t("phoneVerified")}
          checked={isPhoneVerified}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
        <InfoRow label={t("lastLogin")} value={lastLoginDisplay} />
        <InfoRow label={t("accountCreated")} value={accountCreatedDisplay} />
      </div>
    </section>
  );
}

type SecurityStatusProps = {
  label: string;
  checked: boolean;
};

function SecurityStatus({ label, checked }: SecurityStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2
        className={
          checked ? "size-5 text-primary" : "size-5 text-muted-foreground"
        }
      />

      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground font-mono">{value}</span>
    </div>
  );
}
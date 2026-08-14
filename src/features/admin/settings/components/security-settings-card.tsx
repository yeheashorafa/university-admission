"use client";

import { useTranslations } from "next-intl";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import {
  SettingField,
  SettingsCard,
  SettingsInput,
  ToggleSwitch,
} from "./settings-shared";

export function SecuritySettingsCard() {
  const t = useTranslations("admin");

  return (
    <div className="sticky top-6 min-w-0 flex flex-col gap-6">
      <SettingsCard
        title={t("settings.security.title")}
        description={t("settings.security.description")}
      >
        <SettingField
          label={t("settings.security.twoFactorAuthentication")}
          description={t("settings.security.twoFactorAuthenticationDescription")}
        >
          <div className="flex w-full justify-end">
            <ToggleSwitch checked />
          </div>
        </SettingField>

        <SettingField
          label={t("settings.security.sessionTimeout")}
          description={t("settings.security.sessionTimeoutDescription")}
        >
          <SettingsInput type="number" defaultValue="30" min={5} max={180} />
        </SettingField>

        <SettingField
          label={t("settings.security.loginAttemptLimit")}
          description={t("settings.security.loginAttemptLimitDescription")}
        >
          <SettingsInput type="number" defaultValue="5" min={3} max={10} />
        </SettingField>
      </SettingsCard>

      <section className="min-w-0 rounded-xl border border-border bg-primary p-6 text-primary-foreground shadow-[0px_4px_20px_rgba(0,77,64,0.08)]">
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-white/15">
          <ShieldCheck className="size-7" />
        </div>

        <h2 className="text-xl font-bold">
          {t("settings.security.securityStatus")}
        </h2>

        <p className="mt-2 leading-7 opacity-90">
          {t("settings.security.securityStatusDescription")}
        </p>

        <div className="mt-5 rounded-lg bg-white/10 p-4">
          <div className="flex items-center gap-2">
            <LockKeyhole className="size-5" />
            <span className="font-bold">
              {t("settings.security.protected")}
            </span>
          </div>

          <p className="mt-2 text-sm opacity-85">
            {t("settings.security.protectedDescription")}
          </p>
        </div>
      </section>
    </div>
  );
}
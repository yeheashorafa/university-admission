"use client";

import { useTranslations } from "next-intl";
import {
  SettingField,
  SettingsCard,
  SettingsInput,
  SettingsSelect,
  ToggleSwitch,
} from "./settings-shared";

export function GeneralSettingsCard() {
  const t = useTranslations("admin");

  return (
    <SettingsCard
      title={t("settings.general.title")}
      description={t("settings.general.description")}
    >
      <SettingField
        label={t("settings.general.portalName")}
        description={t("settings.general.portalNameDescription")}
      >
        <SettingsInput defaultValue={t("settings.general.portalNameValue")} />
      </SettingField>

      <SettingField
        label={t("settings.general.supportEmail")}
        description={t("settings.general.supportEmailDescription")}
      >
        <SettingsInput defaultValue="admissions@iugaza.edu" />
      </SettingField>

      <SettingField
        label={t("settings.general.defaultLanguage")}
        description={t("settings.general.defaultLanguageDescription")}
      >
        <SettingsSelect defaultValue="en">
          <option value="en">{t("settings.languages.english")}</option>
          <option value="ar">{t("settings.languages.arabic")}</option>
        </SettingsSelect>
      </SettingField>

      <SettingField
        label={t("settings.general.maintenanceMode")}
        description={t("settings.general.maintenanceModeDescription")}
      >
        <div className="flex w-full justify-end">
          <ToggleSwitch checked={false} />
        </div>
      </SettingField>
    </SettingsCard>
  );
}
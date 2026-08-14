"use client";

import { useTranslations } from "next-intl";
import {
  SettingField,
  SettingsCard,
  SettingsInput,
  ToggleSwitch,
} from "./settings-shared";

export function NotificationSettingsCard() {
  const t = useTranslations("admin");

  return (
    <SettingsCard
      title={t("settings.notification.title")}
      description={t("settings.notification.description")}
    >
      <SettingField
        label={t("settings.notification.emailNotifications")}
        description={t("settings.notification.emailNotificationsDescription")}
      >
        <div className="flex w-full justify-end">
          <ToggleSwitch checked />
        </div>
      </SettingField>

      <SettingField
        label={t("settings.notification.smsNotifications")}
        description={t("settings.notification.smsNotificationsDescription")}
      >
        <div className="flex w-full justify-end">
          <ToggleSwitch checked={false} />
        </div>
      </SettingField>

      <SettingField
        label={t("settings.notification.reminderBeforeDeadline")}
        description={t("settings.notification.reminderBeforeDeadlineDescription")}
      >
        <SettingsInput type="number" defaultValue="3" min={1} max={30} />
      </SettingField>

      <SettingField
        label={t("settings.notification.senderName")}
        description={t("settings.notification.senderNameDescription")}
      >
        <SettingsInput defaultValue={t("settings.notification.senderNameValue")} />
      </SettingField>
    </SettingsCard>
  );
}
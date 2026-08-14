"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCustomSelect } from "@/components/ui/admin-custom-select";
import {
  SettingField,
  SettingsCard,
  SettingsInput,
  ToggleSwitch,
} from "./settings-shared";

export function AdmissionSettingsCard() {
  const t = useTranslations("admin");

  // PENDING_BACKEND_API: No backend endpoint exists to fetch or save
  // admission cycle settings. Dropdown is disabled until the backend
  // provides GET/PUT /admin/settings/admission endpoints.
  const [activeCycle] = useState("");

  return (
    <SettingsCard
      title={t("settings.admission.title")}
      description={t("settings.admission.description")}
    >
      <SettingField
        label={t("settings.admission.activeAdmissionCycle")}
        description={t("settings.admission.activeAdmissionCycleDescription")}
      >
        <div className="flex flex-col gap-2">
          <AdminCustomSelect
            id="active-admission-cycle"
            value={activeCycle}
            onChange={() => undefined}
            options={[]}
            disabled
          />
          <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
            PENDING_BACKEND_API — قائمة الدورات من الخادم غير متاحة بعد
          </p>
        </div>
      </SettingField>

      <SettingField
        label={t("settings.admission.applicationOpeningDate")}
        description={t("settings.admission.applicationOpeningDateDescription")}
      >
        <div className="flex flex-col gap-2">
          <SettingsInput type="date" value="" disabled />
          <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
            PENDING_BACKEND_API — تاريخ فتح الطلبات غير محدد من الخادم
          </p>
        </div>
      </SettingField>

      <SettingField
        label={t("settings.admission.applicationDeadline")}
        description={t("settings.admission.applicationDeadlineDescription")}
      >
        <div className="flex flex-col gap-2">
          <SettingsInput type="date" value="" disabled />
          <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
            PENDING_BACKEND_API — تاريخ إغلاق الطلبات غير محدد من الخادم
          </p>
        </div>
      </SettingField>

      <SettingField
        label={t("settings.admission.maximumProgramPreferences")}
        description={t("settings.admission.maximumProgramPreferencesDescription")}
      >
        <SettingsInput type="number" defaultValue="3" min={1} max={10} disabled />
      </SettingField>

      <SettingField
        label={t("settings.admission.allowApplicationEditing")}
        description={t("settings.admission.allowApplicationEditingDescription")}
      >
        <div className="flex w-full justify-end">
          <ToggleSwitch checked />
        </div>
      </SettingField>
    </SettingsCard>
  );
}
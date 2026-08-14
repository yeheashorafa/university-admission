"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { aiReviewModesMock } from "../data/admin-settings.data";
import {
  SettingField,
  SettingsCard,
  SettingsCustomSelect,
  SettingsInput,
  ToggleSwitch,
} from "./settings-shared";

export function AiSettingsCard() {
  const t = useTranslations("admin");
  const [reviewMode, setReviewMode] = useState("assistive");

  return (
    <SettingsCard
      title={t("settings.ai.title")}
      description={t("settings.ai.description")}
    >
      <SettingField
        label={t("settings.ai.reviewMode")}
        description={t("settings.ai.reviewModeDescription")}
      >
        <SettingsCustomSelect
          id="ai-review-mode"
          value={reviewMode}
          onChange={setReviewMode}
          options={aiReviewModesMock.map((mode) => ({
            value: mode.id,
            label: t(`settings.aiModes.${mode.id}.label`),
          }))}
        />
      </SettingField>

      <SettingField
        label={t("settings.ai.autoFlagRiskThreshold")}
        description={t("settings.ai.autoFlagRiskThresholdDescription")}
      >
        <SettingsInput type="number" defaultValue="70" min={0} max={100} />
      </SettingField>

      <SettingField
        label={t("settings.ai.autoApproveSafeDocuments")}
        description={t("settings.ai.autoApproveSafeDocumentsDescription")}
      >
        <div className="flex w-full justify-end">
          <ToggleSwitch checked />
        </div>
      </SettingField>

      <SettingField
        label={t("settings.ai.requireHumanDecision")}
        description={t("settings.ai.requireHumanDecisionDescription")}
      >
        <div className="flex w-full justify-end">
          <ToggleSwitch checked />
        </div>
      </SettingField>
    </SettingsCard>
  );
}
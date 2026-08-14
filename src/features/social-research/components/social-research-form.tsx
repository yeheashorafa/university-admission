"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import {
  familyIncomeRanges,
  housingTypes,
  socialStatuses,
  type SocialResearchFormValues,
} from "../data/social-research.data";

type SocialResearchFormProps = {
  onSubmitForm: (values: SocialResearchFormValues) => void;
};

export function SocialResearchForm({
  onSubmitForm,
}: SocialResearchFormProps) {
  const t = useTranslations("socialResearch");

  const [values, setValues] = useState<SocialResearchFormValues>({
    guardianName: "",
    guardianPhone: "",
    familyMembersCount: "",
    familyIncomeRange: "less_than_500",
    housingType: "owned",
    socialStatus: "single",
    hasScholarshipRequest: false,
    notes: "",
  });

  function updateValue<K extends keyof SocialResearchFormValues>(
    key: K,
    value: SocialResearchFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmitForm(values);
  }

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <h2 className="text-xl font-bold text-primary">{t("formTitle")}</h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("formDescription")}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label={t("guardianName")}
            value={values.guardianName}
            onChange={(value) => updateValue("guardianName", value)}
            placeholder={t("guardianNamePlaceholder")}
            disabled
          />

          <TextInput
            label={t("guardianPhone")}
            value={values.guardianPhone}
            onChange={(value) => updateValue("guardianPhone", value)}
            placeholder="0590000000"
            disabled
          />

          <TextInput
            label={t("familyMembersCount")}
            value={values.familyMembersCount}
            onChange={(value) => updateValue("familyMembersCount", value)}
            placeholder="6"
            disabled
          />

          <SelectInput
            label={t("familyIncomeRange")}
            value={values.familyIncomeRange}
            onChange={(value) =>
              updateValue(
                "familyIncomeRange",
                value as SocialResearchFormValues["familyIncomeRange"]
              )
            }
            options={familyIncomeRanges.map((item) => ({
              value: item,
              label: t(`incomeRanges.${item}`),
            }))}
            disabled
          />

          <SelectInput
            label={t("housingType")}
            value={values.housingType}
            onChange={(value) =>
              updateValue(
                "housingType",
                value as SocialResearchFormValues["housingType"]
              )
            }
            options={housingTypes.map((item) => ({
              value: item,
              label: t(`housingTypes.${item}`),
            }))}
            disabled
          />

          <SelectInput
            label={t("socialStatus")}
            value={values.socialStatus}
            onChange={(value) =>
              updateValue(
                "socialStatus",
                value as SocialResearchFormValues["socialStatus"]
              )
            }
            options={socialStatuses.map((item) => ({
              value: item,
              label: t(`socialStatuses.${item}`),
            }))}
            disabled
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-border bg-background p-4 opacity-60">
          <input
            type="checkbox"
            checked={values.hasScholarshipRequest}
            onChange={(event) =>
              updateValue("hasScholarshipRequest", event.target.checked)
            }
            disabled
            className="mt-1 size-5 rounded border-input text-primary focus:ring-primary disabled:cursor-not-allowed"
          />

          <div>
            <p className="font-bold text-foreground">
              {t("hasScholarshipRequest")}
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t("hasScholarshipRequestDescription")}
            </p>
          </div>
        </label>

        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            {t("notes")}
          </label>

          <textarea
            value={values.notes}
            onChange={(event) => updateValue("notes", event.target.value)}
            placeholder={t("notesPlaceholder")}
            disabled
            className="min-h-[130px] w-full rounded-[18px] border border-input bg-background p-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-primary text-sm font-bold text-primary-foreground transition opacity-50 cursor-not-allowed md:w-auto md:px-8"
        >
          <Send className="size-5" />
          {t("submit")} (PENDING_BACKEND_API)
        </button>
      </form>
    </section>
  );
}

type TextInputProps = {
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function TextInput({ label, value, placeholder, disabled, onChange }: TextInputProps) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-12 w-full rounded-[16px] border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

type SelectInputProps = {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  disabled?: boolean;
  onChange: (value: string) => void;
};

function SelectInput({ label, value, options, disabled, onChange }: SelectInputProps) {
  const id = label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-12 w-full rounded-[16px] border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
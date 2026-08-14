"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Save, UserRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormSkeleton } from "@/components/common/loading/form-skeleton";
import { useMyProfileQuery, useUpdateMyProfileMutation } from "@/hooks/queries/use-profile-queries";

export function PersonalInformationForm() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: profile, isLoading } = useMyProfileQuery();
  const updateMutation = useUpdateMyProfileMutation();

  const pi = profile?.personal_information;
  const [userEdits, setUserEdits] = useState<Record<string, string>>({});

  const formValues = {
    firstName: userEdits.firstName ?? pi?.first_name_ar ?? "",
    fatherName: userEdits.fatherName ?? pi?.father_name_ar ?? "",
    familyName: userEdits.familyName ?? pi?.family_name_ar ?? "",
    nationalId: userEdits.nationalId ?? pi?.national_id ?? "",
    gender: userEdits.gender ?? pi?.gender ?? "male",
    nationality: userEdits.nationality ?? pi?.nationality ?? "",
  };

  function updateField(field: string, value: string) {
    setUserEdits((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        personal_information: {
          first_name_ar: formValues.firstName,
          father_name_ar: formValues.fatherName,
          family_name_ar: formValues.familyName,
          national_id: formValues.nationalId,
          gender: (formValues.gender === "female" ? "female" : "male") as "male" | "female",
          nationality: formValues.nationality,
        },
      });
      toast.success(isAr ? "تم حفظ البيانات الشخصية بنجاح" : "Personal details saved successfully");
    } catch (err) {
      const msg = (err as Error)?.message || (isAr ? "فشل حفظ البيانات" : "Failed to save details");
      toast.error(msg);
    }
  }

  if (isLoading) {
    return <FormSkeleton fields={4} />;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
            <UserRound className="size-6 text-secondary" />
            {t("personalInformation")}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {t("personalInformationDescription")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ProfileInput
          label={t("firstName")}
          value={formValues.firstName}
          onChange={(value) => updateField("firstName", value)}
        />

        <ProfileInput
          label={t("fatherName")}
          value={formValues.fatherName}
          onChange={(value) => updateField("fatherName", value)}
        />

        <ProfileInput
          label={t("familyName")}
          value={formValues.familyName}
          onChange={(value) => updateField("familyName", value)}
        />

        <ProfileInput
          label={t("nationalId")}
          value={formValues.nationalId}
          onChange={(value) => updateField("nationalId", value)}
        />

        <div>
          <label
            htmlFor="gender"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("gender")}
          </label>

          <select
            id="gender"
            value={formValues.gender}
            onChange={(event) => updateField("gender", event.target.value)}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="male">{t("male")}</option>
            <option value="female">{t("female")}</option>
          </select>
        </div>

        <ProfileInput
          label={t("nationality")}
          value={formValues.nationality}
          onChange={(value) => updateField("nationality", value)}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          {t("savePersonalInfo")}
        </button>
      </div>
    </section>
  );
}

type ProfileInputProps = {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
};

function ProfileInput({
  label,
  value,
  type = "text",
  onChange,
}: ProfileInputProps) {
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
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
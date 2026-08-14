"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Mail, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormSkeleton } from "@/components/common/loading/form-skeleton";
import { useMyProfileQuery, useUpdateMyProfileMutation } from "@/hooks/queries/use-profile-queries";
import { useSocialInformationQuery, useUpdateSocialInformationMutation } from "@/hooks/queries/use-social-information-queries";

export function ContactInformationForm() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: profile, isLoading: loadingProfile } = useMyProfileQuery();
  const { data: social, isLoading: loadingSocial } = useSocialInformationQuery();

  const updateProfileMutation = useUpdateMyProfileMutation();
  const updateSocialMutation = useUpdateSocialInformationMutation();

  const [userEdits, setUserEdits] = useState<Record<string, string>>({});

  const formValues = {
    email: userEdits.email ?? profile?.email ?? "",
    phone: userEdits.phone ?? profile?.phone ?? social?.phone_landline ?? "",
    alternativePhone: userEdits.alternativePhone ?? social?.phone_landline ?? "",
    city: userEdits.city ?? social?.city ?? "",
    address:
      userEdits.address ??
      [social?.governorate, social?.city, social?.neighborhood, social?.street].filter(Boolean).join(", "),
  };

  function updateField(field: string, value: string) {
    setUserEdits((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave() {
    try {
      if (formValues.phone) {
        await updateProfileMutation.mutateAsync({ phone: formValues.phone });
      }
      await updateSocialMutation.mutateAsync({
        city: formValues.city,
        street: formValues.address,
        phone_landline: formValues.alternativePhone,
      });
      toast.success(isAr ? "تم حفظ معلومات الاتصال بنجاح" : "Contact details saved successfully");
    } catch (err) {
      const msg = (err as Error)?.message || (isAr ? "فشل حفظ معلومات الاتصال" : "Failed to save contact details");
      toast.error(msg);
    }
  }

  if (loadingProfile || loadingSocial) {
    return <FormSkeleton fields={4} />;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
          <Mail className="size-6 text-secondary" />
          {t("contactInformation")}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {t("contactInformationDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ProfileInput
          label={t("emailAddress")}
          type="email"
          value={formValues.email}
          onChange={(value) => updateField("email", value)}
        />

        <ProfileInput
          label={t("phoneNumber")}
          value={formValues.phone}
          onChange={(value) => updateField("phone", value)}
        />

        <ProfileInput
          label={t("alternativePhone")}
          value={formValues.alternativePhone}
          onChange={(value) => updateField("alternativePhone", value)}
        />

        <ProfileInput
          label={t("city")}
          value={formValues.city}
          onChange={(value) => updateField("city", value)}
        />

        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium text-muted-foreground"
          >
            {t("address")}
          </label>

          <textarea
            id="address"
            value={formValues.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="min-h-[110px] w-full rounded-lg border border-input bg-card p-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateProfileMutation.isPending || updateSocialMutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {updateProfileMutation.isPending || updateSocialMutation.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Save className="size-5" />
          )}
          {t("saveContactInfo")}
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
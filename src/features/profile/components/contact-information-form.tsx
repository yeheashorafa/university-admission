"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Mail, Save, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { FormSkeleton } from "@/components/common/loading/form-skeleton";
import { useMyProfileQuery, useUpdateMyProfileMutation } from "@/hooks/queries/use-profile-queries";
import { useSocialInformationQuery, useUpdateSocialInformationMutation } from "@/hooks/queries/use-social-information-queries";
import { useAuthStore } from "@/stores/auth.store";

export function ContactInformationForm() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isAr = locale === "ar";

  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading: loadingProfile } = useMyProfileQuery();
  const { data: social, isLoading: loadingSocial } = useSocialInformationQuery();

  const updateProfileMutation = useUpdateMyProfileMutation();
  const updateSocialMutation = useUpdateSocialInformationMutation();

  const [userEdits, setUserEdits] = useState<Record<string, string>>({});

  // Fallback social information from profile if separate social query returned empty
  const effectiveSocial = social || profile?.social_information;

  const initialEmail = profile?.email || user?.email || "";
  const initialPhone = profile?.phone || user?.phone || "";
  const initialAlternativePhone = effectiveSocial?.phone_landline || "";
  const initialCity = effectiveSocial?.city || profile?.city || "";
  const initialAddress =
    [
      effectiveSocial?.governorate,
      effectiveSocial?.city,
      effectiveSocial?.neighborhood,
      effectiveSocial?.street,
    ]
      .filter(Boolean)
      .join(", ") ||
    profile?.address ||
    "";

  const formValues = {
    email: initialEmail,
    phone: userEdits.phone ?? initialPhone,
    alternativePhone: userEdits.alternativePhone ?? initialAlternativePhone,
    city: userEdits.city ?? initialCity,
    address: userEdits.address ?? initialAddress,
  };

  function updateField(field: string, value: string) {
    setUserEdits((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSave() {
    let hasChanges = false;
    try {
      // 1. Check phone change for profile update
      const trimmedPhone = formValues.phone.trim();
      if (userEdits.phone !== undefined && trimmedPhone !== initialPhone.trim()) {
        if (trimmedPhone) {
          await updateProfileMutation.mutateAsync({ phone: trimmedPhone });
          hasChanges = true;
        }
      }

      // 2. Build partial social update payload (only non-empty changed fields)
      const socialPayload: Record<string, string> = {};

      if (userEdits.city !== undefined && formValues.city.trim() !== initialCity.trim()) {
        const trimmedCity = formValues.city.trim();
        if (trimmedCity) socialPayload.city = trimmedCity;
      }

      if (userEdits.address !== undefined && formValues.address.trim() !== initialAddress.trim()) {
        const trimmedAddress = formValues.address.trim();
        if (trimmedAddress) socialPayload.street = trimmedAddress;
      }

      if (
        userEdits.alternativePhone !== undefined &&
        formValues.alternativePhone.trim() !== initialAlternativePhone.trim()
      ) {
        const trimmedAlt = formValues.alternativePhone.trim();
        if (trimmedAlt) socialPayload.phone_landline = trimmedAlt;
      }

      if (Object.keys(socialPayload).length > 0) {
        await updateSocialMutation.mutateAsync(socialPayload);
        hasChanges = true;
      }

      if (!hasChanges) {
        toast.info(isAr ? "لم يتم إجراء أي تغييرات" : "No changes to save");
        return;
      }

      setUserEdits({});
      toast.success(isAr ? "تم حفظ معلومات الاتصال بنجاح" : "Contact details saved successfully");
    } catch (err) {
      const msg = (err as Error)?.message || (isAr ? "فشل حفظ معلومات الاتصال" : "Failed to save contact details");
      toast.error(msg);
    }
  }

  if (loadingProfile && loadingSocial) {
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
        {/* Email Address - Read Only */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="email-address"
              className="block text-sm font-medium text-muted-foreground"
            >
              {t("emailAddress")}
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
              <Lock className="size-3" />
              {isAr ? "غير قابل للتعديل" : "Read-only"}
            </span>
          </div>

          <input
            id="email-address"
            type="email"
            value={formValues.email}
            disabled
            readOnly
            className="h-12 w-full rounded-lg border border-input bg-muted/50 px-4 text-base text-muted-foreground outline-none cursor-not-allowed"
          />
        </div>

        <ProfileInput
          id="phone-number"
          label={t("phoneNumber")}
          value={formValues.phone}
          onChange={(value) => updateField("phone", value)}
        />

        <ProfileInput
          id="alternative-phone"
          label={t("alternativePhone")}
          value={formValues.alternativePhone}
          onChange={(value) => updateField("alternativePhone", value)}
        />

        <ProfileInput
          id="city"
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
  id?: string;
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
};

function ProfileInput({
  id,
  label,
  value,
  type = "text",
  onChange,
}: ProfileInputProps) {
  const inputId = id || label.toLowerCase().replaceAll(" ", "-");

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
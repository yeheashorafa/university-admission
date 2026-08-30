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
  const { 
    data: social, 
    isLoading: loadingSocial, 
    isError: isSocialError, 

    refetch: refetchSocial 
  } = useSocialInformationQuery();

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

  const firstAddress = (profile?.addresses?.[0] ?? null) as Record<string, string> | null;
  const firstEmergency = (profile?.emergency_contacts?.[0] ?? null) as Record<string, string> | null;
  const initialGovernorate = firstAddress?.governorate ?? "";
  const initialAddressLine = firstAddress?.address_line ?? "";
  const initialEmergencyName = firstEmergency?.name ?? "";
  const initialEmergencyRelationship = firstEmergency?.relationship ?? "";
  const initialEmergencyPhone = firstEmergency?.phone ?? "";

  const formValues = {
    email: initialEmail,
    phone: userEdits.phone ?? initialPhone,
    alternativePhone: userEdits.alternativePhone ?? initialAlternativePhone,
    city: userEdits.city ?? initialCity,
    address: userEdits.address ?? initialAddress,
    governorate: userEdits.governorate ?? initialGovernorate,
    addressLine: userEdits.addressLine ?? initialAddressLine,
    emergencyName: userEdits.emergencyName ?? initialEmergencyName,
    emergencyRelationship: userEdits.emergencyRelationship ?? initialEmergencyRelationship,
    emergencyPhone: userEdits.emergencyPhone ?? initialEmergencyPhone,
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
      // 1. Build profile update payload (phone, addresses, emergency contacts)
      const profilePayload: Record<string, unknown> = {};
      const trimmedPhone = formValues.phone.trim();
      if (userEdits.phone !== undefined && trimmedPhone !== initialPhone.trim() && trimmedPhone) {
        profilePayload.phone = trimmedPhone;
      }

      const governorate = formValues.governorate.trim();
      const addressLine = formValues.addressLine.trim();
      const emergencyName = formValues.emergencyName.trim();
      const emergencyRelationship = formValues.emergencyRelationship.trim();
      const emergencyPhone = formValues.emergencyPhone.trim();

      if (userEdits.governorate !== undefined || userEdits.addressLine !== undefined) {
        if (governorate || addressLine) {
          profilePayload.addresses = [
            { type: "current", governorate, address_line: addressLine },
          ];
        }
      }

      if (
        userEdits.emergencyName !== undefined ||
        userEdits.emergencyRelationship !== undefined ||
        userEdits.emergencyPhone !== undefined
      ) {
        if (emergencyName && emergencyPhone) {
          profilePayload.emergency_contacts = [
            {
              name: emergencyName,
              relationship: emergencyRelationship,
              phone: emergencyPhone,
              is_primary: true,
            },
          ];
        }
      }

      if (Object.keys(profilePayload).length > 0) {
        await updateProfileMutation.mutateAsync(profilePayload);
        hasChanges = true;
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

      {isSocialError && (
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[18px] border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-center gap-3 text-sm font-semibold text-destructive">
            <Lock className="size-5 shrink-0" />
            <span>
              {isAr
                ? "تعذر تحميل بيانات التواصل الإضافية (مثل الهاتف البديل والمدينة)."
                : "Unable to load additional social/contact information."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetchSocial()}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-destructive px-4 text-xs font-bold text-destructive-foreground transition hover:bg-destructive/90"
          >
            {isAr ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      )}

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

        <div className="md:col-span-2 mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-5">
          <h3 className="mb-4 text-sm font-bold text-foreground">{t("currentAddress")}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileInput
              id="governorate"
              label={t("governorate")}
              value={formValues.governorate}
              onChange={(value) => updateField("governorate", value)}
            />
            <ProfileInput
              id="address-line"
              label={t("addressLine")}
              value={formValues.addressLine}
              onChange={(value) => updateField("addressLine", value)}
            />
          </div>
        </div>

        <div className="md:col-span-2 mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-5">
          <h3 className="mb-4 text-sm font-bold text-foreground">{t("emergencyContact")}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ProfileInput
              id="emergency-name"
              label={t("contactName")}
              value={formValues.emergencyName}
              onChange={(value) => updateField("emergencyName", value)}
            />
            <ProfileInput
              id="emergency-relationship"
              label={t("relationship")}
              value={formValues.emergencyRelationship}
              onChange={(value) => updateField("emergencyRelationship", value)}
            />
            <ProfileInput
              id="emergency-phone"
              label={t("contactPhone")}
              value={formValues.emergencyPhone}
              onChange={(value) => updateField("emergencyPhone", value)}
            />
          </div>
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
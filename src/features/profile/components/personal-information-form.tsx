"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Save, UserRound, Loader2, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { FormSkeleton } from "@/components/common/loading/form-skeleton";
import { useMyProfileQuery, useUpdateMyProfileMutation } from "@/hooks/queries/use-profile-queries";
import { extractApiError } from "@/lib/api/api-error";
import type { PersonalInformation } from "@/services/profile.service";

type FormErrors = Partial<Record<keyof PersonalInformation, string>>;

export function PersonalInformationForm() {
  const t = useTranslations("profile");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: profile, isLoading, isFetched } = useMyProfileQuery();
  const updateMutation = useUpdateMyProfileMutation();

  const isProfileLoaded = !isLoading && isFetched && profile !== undefined;
  const pi = profile?.personal_information;
  const nationalIdValue =
    pi?.national_id || profile?.nationalId || profile?.national_id || "";

  // Base profile is incomplete if ANY of the required 6 base fields is missing/null in backend
  const isBaseProfileIncomplete =
    isProfileLoaded &&
    (!pi?.first_name_ar ||
      !pi?.father_name_ar ||
      !pi?.grandfather_name_ar ||
      !pi?.family_name_ar ||
      !pi?.gender ||
      !pi?.nationality);

  const [userEdits, setUserEdits] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const formValues = {
    first_name_ar: userEdits.first_name_ar ?? pi?.first_name_ar ?? "",
    father_name_ar: userEdits.father_name_ar ?? pi?.father_name_ar ?? "",
    grandfather_name_ar: userEdits.grandfather_name_ar ?? pi?.grandfather_name_ar ?? "",
    family_name_ar: userEdits.family_name_ar ?? pi?.family_name_ar ?? "",
    first_name_en: userEdits.first_name_en ?? pi?.first_name_en ?? "",
    father_name_en: userEdits.father_name_en ?? pi?.father_name_en ?? "",
    grandfather_name_en: userEdits.grandfather_name_en ?? pi?.grandfather_name_en ?? "",
    family_name_en: userEdits.family_name_en ?? pi?.family_name_en ?? "",
    gender: (userEdits.gender ?? pi?.gender ?? "male") as "male" | "female",
    nationality: userEdits.nationality ?? pi?.nationality ?? "ps",
    date_of_birth: userEdits.date_of_birth ?? pi?.date_of_birth ?? "",
    place_of_birth: userEdits.place_of_birth ?? pi?.place_of_birth ?? "",
    official_address: userEdits.official_address ?? pi?.official_address ?? "",
  };

  function updateField(field: keyof PersonalInformation, value: string) {
    setUserEdits((current) => ({
      ...current,
      [field]: value,
    }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (formError) {
      setFormError(null);
    }
  }

  function handleBackendError(err: unknown) {
    const apiError = extractApiError(err);
    const backendMessage = apiError.message || "";
    const backendErrors = apiError.errors;

    let allErrorsCombined = backendMessage;
    if (backendErrors) {
      for (const key of Object.keys(backendErrors)) {
        allErrorsCombined += " " + (backendErrors[key]?.join(" ") || "");
      }
    }

    const lowerCombined = allErrorsCombined.toLowerCase();

    let displayMsg = apiError.message;
    if (lowerCombined.includes("is required when personal information is present")) {
      displayMsg = isAr
        ? "يرجى تعبئة جميع بياناتك الشخصية الأساسية قبل الحفظ."
        : "Please fill in all basic personal details before saving.";
    } else if (lowerCombined.includes("field is required.")) {
      displayMsg = isAr
        ? "لا يمكن إرسال حقل فارغ. يرجى تعبئة الحقل أو تركه بدون تعديل."
        : "Cannot submit empty field. Please fill or leave unchanged.";
    }

    const mappedFieldErrors: FormErrors = {};
    if (backendErrors) {
      const keys: (keyof PersonalInformation)[] = [
        "first_name_ar",
        "father_name_ar",
        "grandfather_name_ar",
        "family_name_ar",
        "first_name_en",
        "father_name_en",
        "grandfather_name_en",
        "family_name_en",
        "gender",
        "nationality",
        "date_of_birth",
        "place_of_birth",
        "official_address",
      ];
      for (const k of keys) {
        if (backendErrors[k]?.[0] || backendErrors[`personal_information.${k}`]?.[0]) {
          mappedFieldErrors[k] =
            backendErrors[k]?.[0] || backendErrors[`personal_information.${k}`]?.[0];
        }
      }
    }

    setFieldErrors(mappedFieldErrors);
    setFormError(displayMsg);
    toast.error(displayMsg);
  }

  function validateOptionalFields(newFieldErrors: FormErrors) {
    const enKeys: (keyof typeof formValues)[] = [
      "first_name_en",
      "father_name_en",
      "grandfather_name_en",
      "family_name_en",
    ];
    for (const k of enKeys) {
      const val = formValues[k];
      if (val && val.length > 255) {
        newFieldErrors[k] = isAr ? "يجب ألا يتجاوز 255 حرفاً" : "Must not exceed 255 characters";
      }
    }
    if (formValues.date_of_birth.trim()) {
      const dob = formValues.date_of_birth.trim();
      const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dobRegex.test(dob)) {
        newFieldErrors.date_of_birth = isAr
          ? "تاريخ الميلاد يجب أن يكون بصيغة YYYY-MM-DD"
          : "Date of birth must be YYYY-MM-DD format";
      }
    }
    if (formValues.place_of_birth.trim() && formValues.place_of_birth.trim().length > 255) {
      newFieldErrors.place_of_birth = isAr ? "يجب ألا يتجاوز 255 حرفاً" : "Must not exceed 255 characters";
    }
    if (formValues.official_address.trim() && formValues.official_address.trim().length > 2000) {
      newFieldErrors.official_address = isAr ? "يجب ألا يتجاوز 2000 حرفاً" : "Must not exceed 2000 characters";
    }
  }

  async function handleSave() {
    setFormError(null);
    setFieldErrors({});

    const newFieldErrors: FormErrors = {};

    if (isBaseProfileIncomplete) {
      // First base completion: ALL 6 required base fields must be present
      if (!formValues.first_name_ar.trim()) {
        newFieldErrors.first_name_ar = isAr ? "الاسم الأول مطلوب" : "First name is required";
      }
      if (!formValues.father_name_ar.trim()) {
        newFieldErrors.father_name_ar = isAr ? "اسم الأب مطلوب" : "Father name is required";
      }
      if (!formValues.grandfather_name_ar.trim()) {
        newFieldErrors.grandfather_name_ar = isAr ? "اسم الجد مطلوب" : "Grandfather name is required";
      }
      if (!formValues.family_name_ar.trim()) {
        newFieldErrors.family_name_ar = isAr ? "اسم العائلة مطلوب" : "Family name is required";
      }
      if (!formValues.gender) {
        newFieldErrors.gender = isAr ? "الجنس مطلوب" : "Gender is required";
      }
      if (!formValues.nationality.trim()) {
        newFieldErrors.nationality = isAr ? "الجنسية مطلوبة" : "Nationality is required";
      }

      validateOptionalFields(newFieldErrors);

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        const baseMsg = isAr
          ? "يرجى تعبئة جميع بياناتك الشخصية الأساسية قبل الحفظ."
          : "Please fill in all basic personal details before saving.";
        setFormError(baseMsg);
        toast.error(baseMsg);
        return;
      }

      // Build payload containing ONLY valid non-empty values. Do NOT send national_id.
      const payload: PersonalInformation = {
        first_name_ar: formValues.first_name_ar.trim(),
        father_name_ar: formValues.father_name_ar.trim(),
        grandfather_name_ar: formValues.grandfather_name_ar.trim(),
        family_name_ar: formValues.family_name_ar.trim(),
        gender: formValues.gender,
        nationality: formValues.nationality.trim() || "ps",
      };

      if (formValues.first_name_en.trim()) payload.first_name_en = formValues.first_name_en.trim();
      if (formValues.father_name_en.trim()) payload.father_name_en = formValues.father_name_en.trim();
      if (formValues.grandfather_name_en.trim()) payload.grandfather_name_en = formValues.grandfather_name_en.trim();
      if (formValues.family_name_en.trim()) payload.family_name_en = formValues.family_name_en.trim();
      if (formValues.date_of_birth.trim()) payload.date_of_birth = formValues.date_of_birth.trim();
      if (formValues.place_of_birth.trim()) payload.place_of_birth = formValues.place_of_birth.trim();
      if (formValues.official_address.trim()) payload.official_address = formValues.official_address.trim();

      try {
        await updateMutation.mutateAsync({
          personal_information: payload,
        });
        setUserEdits({});
        toast.success(isAr ? "تم حفظ البيانات الشخصية بنجاح" : "Personal details saved successfully");
      } catch (err) {
        handleBackendError(err);
      }
    } else {
      // Base profile already exists in backend. Partial update mode: send ONLY changed non-empty fields.
      const changedFields: Partial<PersonalInformation> = {};
      let hasEmptyClearedField = false;

      const checkField = (
        key: keyof PersonalInformation,
        val: string,
        initialVal: string,
        isRequired: boolean
      ) => {
        if (userEdits[key] !== undefined && userEdits[key] !== initialVal) {
          const trimmed = val.trim();
          if (!trimmed) {
            if (isRequired) {
              hasEmptyClearedField = true;
              newFieldErrors[key] = isAr
                ? "لا يمكن إرسال حقل فارغ. يرجى تعبئة الحقل أو تركه بدون تعديل."
                : "Cannot submit empty field. Please fill or leave unchanged.";
            }
          } else {
            if (key === "gender") {
              changedFields.gender = trimmed === "female" ? "female" : "male";
            } else {
              changedFields[key] = trimmed;
            }
          }
        }
      };

      checkField("first_name_ar", formValues.first_name_ar, pi?.first_name_ar ?? "", true);
      checkField("father_name_ar", formValues.father_name_ar, pi?.father_name_ar ?? "", true);
      checkField("grandfather_name_ar", formValues.grandfather_name_ar, pi?.grandfather_name_ar ?? "", true);
      checkField("family_name_ar", formValues.family_name_ar, pi?.family_name_ar ?? "", true);
      checkField("gender", formValues.gender, pi?.gender ?? "male", true);
      checkField("nationality", formValues.nationality, pi?.nationality ?? "ps", true);

      checkField("first_name_en", formValues.first_name_en, pi?.first_name_en ?? "", false);
      checkField("father_name_en", formValues.father_name_en, pi?.father_name_en ?? "", false);
      checkField("grandfather_name_en", formValues.grandfather_name_en, pi?.grandfather_name_en ?? "", false);
      checkField("family_name_en", formValues.family_name_en, pi?.family_name_en ?? "", false);
      checkField("date_of_birth", formValues.date_of_birth, pi?.date_of_birth ?? "", false);
      checkField("place_of_birth", formValues.place_of_birth, pi?.place_of_birth ?? "", false);
      checkField("official_address", formValues.official_address, pi?.official_address ?? "", false);

      validateOptionalFields(newFieldErrors);

      if (hasEmptyClearedField || Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        const emptyMsg = isAr
          ? "لا يمكن إرسال حقل فارغ. يرجى تعبئة الحقل أو تركه بدون تعديل."
          : "Cannot submit empty field. Please fill or leave unchanged.";
        setFormError(emptyMsg);
        toast.error(emptyMsg);
        return;
      }

      if (Object.keys(changedFields).length === 0) {
        toast.info(isAr ? "لم يتم إجراء أي تغييرات" : "No changes to save");
        return;
      }

      try {
        await updateMutation.mutateAsync({
          personal_information: changedFields,
        });
        setUserEdits({});
        toast.success(isAr ? "تم حفظ التغييرات بنجاح" : "Changes saved successfully");
      } catch (err) {
        handleBackendError(err);
      }
    }
  }

  if (isLoading || !isProfileLoaded) {
    return <FormSkeleton fields={6} />;
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

      {formError && (
        <div className="mb-6 flex items-center gap-3 rounded-[18px] border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          <AlertCircle className="size-5 shrink-0 text-destructive" />
          <span>{formError}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* National ID Read-Only Display */}
        {nationalIdValue && (
          <div className="rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("nationalId")}
                </label>
                <div className="mt-1 font-mono text-lg font-bold text-foreground">
                  {nationalIdValue}
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Lock className="size-3.5" />
                <span>{t("readOnlyNationalId")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Required Arabic Names */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-foreground">
            {isAr ? "الاسم باللغة العربية *" : "Name in Arabic *"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileInput
              id="first-name-ar"
              label={t("firstName")}
              value={formValues.first_name_ar}
              error={fieldErrors.first_name_ar}
              onChange={(value) => updateField("first_name_ar", value)}
            />
            <ProfileInput
              id="father-name-ar"
              label={t("fatherName")}
              value={formValues.father_name_ar}
              error={fieldErrors.father_name_ar}
              onChange={(value) => updateField("father_name_ar", value)}
            />
            <ProfileInput
              id="grandfather-name-ar"
              label={t("grandfatherName")}
              value={formValues.grandfather_name_ar}
              error={fieldErrors.grandfather_name_ar}
              onChange={(value) => updateField("grandfather_name_ar", value)}
            />
            <ProfileInput
              id="family-name-ar"
              label={t("familyName")}
              value={formValues.family_name_ar}
              error={fieldErrors.family_name_ar}
              onChange={(value) => updateField("family_name_ar", value)}
            />
          </div>
        </div>

        {/* Gender & Nationality */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="gender"
              className="mb-2 block text-sm font-medium text-muted-foreground"
            >
              {t("gender")} *
            </label>
            <select
              id="gender"
              value={formValues.gender}
              onChange={(event) => updateField("gender", event.target.value)}
              className={`h-12 w-full rounded-lg border bg-card px-4 text-base outline-none transition ${
                fieldErrors.gender
                  ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
                  : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
              }`}
            >
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
            </select>
            {fieldErrors.gender && (
              <p className="mt-1 text-xs font-medium text-destructive">{fieldErrors.gender}</p>
            )}
          </div>

          <ProfileInput
            id="nationality"
            label={`${t("nationality")} *`}
            value={formValues.nationality}
            error={fieldErrors.nationality}
            onChange={(value) => updateField("nationality", value)}
          />
        </div>

        {/* Optional English Names */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-muted-foreground">
            {isAr ? "الاسم باللغة الإنجليزية (اختياري)" : "Name in English (Optional)"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileInput
              id="first-name-en"
              label={t("firstNameEn")}
              value={formValues.first_name_en}
              error={fieldErrors.first_name_en}
              onChange={(value) => updateField("first_name_en", value)}
            />
            <ProfileInput
              id="father-name-en"
              label={t("fatherNameEn")}
              value={formValues.father_name_en}
              error={fieldErrors.father_name_en}
              onChange={(value) => updateField("father_name_en", value)}
            />
            <ProfileInput
              id="grandfather-name-en"
              label={t("grandfatherNameEn")}
              value={formValues.grandfather_name_en}
              error={fieldErrors.grandfather_name_en}
              onChange={(value) => updateField("grandfather_name_en", value)}
            />
            <ProfileInput
              id="family-name-en"
              label={t("familyNameEn")}
              value={formValues.family_name_en}
              error={fieldErrors.family_name_en}
              onChange={(value) => updateField("family_name_en", value)}
            />
          </div>
        </div>

        {/* Date of Birth & Place of Birth */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ProfileInput
            id="date-of-birth"
            label={`${t("birthDate")} (${isAr ? "اختياري YYYY-MM-DD" : "Optional YYYY-MM-DD"})`}
            value={formValues.date_of_birth}
            error={fieldErrors.date_of_birth}
            placeholder="2005-01-15"
            onChange={(value) => updateField("date_of_birth", value)}
          />
          <ProfileInput
            id="place-of-birth"
            label={`${t("placeOfBirth")} (${isAr ? "اختياري" : "Optional"})`}
            value={formValues.place_of_birth}
            error={fieldErrors.place_of_birth}
            onChange={(value) => updateField("place_of_birth", value)}
          />
        </div>

        {/* Official Address */}
        <div>
          <ProfileInput
            id="official-address"
            label={`${t("officialAddress")} (${isAr ? "اختياري" : "Optional"})`}
            value={formValues.official_address}
            error={fieldErrors.official_address}
            onChange={(value) => updateField("official_address", value)}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end border-t border-border pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isProfileLoaded || updateMutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
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
  id: string;
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
};

function ProfileInput({
  id,
  label,
  value,
  type = "text",
  placeholder,
  error,
  onChange,
}: ProfileInputProps) {
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
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`h-12 w-full rounded-lg border bg-card px-4 text-base outline-none transition ${
          error
            ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive"
            : "border-input focus:border-primary focus:ring-1 focus:ring-primary"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
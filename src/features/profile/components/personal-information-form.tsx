"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Save, UserRound, Loader2, AlertCircle } from "lucide-react";
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
  // First save is true ONLY after profile query has finished loading AND personal_information is null or undefined
  const isFirstSave = isProfileLoaded && (pi === null || pi === undefined);

  const [userEdits, setUserEdits] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const formValues = {
    first_name_ar: userEdits.first_name_ar ?? pi?.first_name_ar ?? "",
    father_name_ar: userEdits.father_name_ar ?? pi?.father_name_ar ?? "",
    grandfather_name_ar: userEdits.grandfather_name_ar ?? pi?.grandfather_name_ar ?? "",
    family_name_ar: userEdits.family_name_ar ?? pi?.family_name_ar ?? "",
    national_id: userEdits.national_id ?? pi?.national_id ?? "",
    gender: (userEdits.gender ?? pi?.gender ?? "male") as "male" | "female",
    nationality: userEdits.nationality ?? pi?.nationality ?? "ps",
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
      if (backendErrors.national_id?.[0] || backendErrors["personal_information.national_id"]?.[0]) {
        mappedFieldErrors.national_id = backendErrors.national_id?.[0] || backendErrors["personal_information.national_id"]?.[0];
      }
      if (backendErrors.first_name_ar?.[0] || backendErrors["personal_information.first_name_ar"]?.[0]) {
        mappedFieldErrors.first_name_ar = backendErrors.first_name_ar?.[0] || backendErrors["personal_information.first_name_ar"]?.[0];
      }
      if (backendErrors.father_name_ar?.[0] || backendErrors["personal_information.father_name_ar"]?.[0]) {
        mappedFieldErrors.father_name_ar = backendErrors.father_name_ar?.[0] || backendErrors["personal_information.father_name_ar"]?.[0];
      }
      if (backendErrors.grandfather_name_ar?.[0] || backendErrors["personal_information.grandfather_name_ar"]?.[0]) {
        mappedFieldErrors.grandfather_name_ar = backendErrors.grandfather_name_ar?.[0] || backendErrors["personal_information.grandfather_name_ar"]?.[0];
      }
      if (backendErrors.family_name_ar?.[0] || backendErrors["personal_information.family_name_ar"]?.[0]) {
        mappedFieldErrors.family_name_ar = backendErrors.family_name_ar?.[0] || backendErrors["personal_information.family_name_ar"]?.[0];
      }
      if (backendErrors.gender?.[0] || backendErrors["personal_information.gender"]?.[0]) {
        mappedFieldErrors.gender = backendErrors.gender?.[0] || backendErrors["personal_information.gender"]?.[0];
      }
      if (backendErrors.nationality?.[0] || backendErrors["personal_information.nationality"]?.[0]) {
        mappedFieldErrors.nationality = backendErrors.nationality?.[0] || backendErrors["personal_information.nationality"]?.[0];
      }
    }

    setFieldErrors(mappedFieldErrors);
    setFormError(displayMsg);
    toast.error(displayMsg);
  }

  async function handleSave() {
    setFormError(null);
    setFieldErrors({});

    const newFieldErrors: FormErrors = {};

    if (isFirstSave) {
      // First save requires all 7 fields to be present and valid
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
      if (!formValues.national_id.trim()) {
        newFieldErrors.national_id = isAr ? "رقم الهوية مطلوب" : "National ID is required";
      } else if (formValues.national_id.trim().length > 20) {
        newFieldErrors.national_id = isAr ? "رقم الهوية يجب ألا يتجاوز 20 خانة" : "National ID cannot exceed 20 characters";
      }
      if (!formValues.gender) {
        newFieldErrors.gender = isAr ? "الجنس مطلوب" : "Gender is required";
      }
      if (!formValues.nationality.trim()) {
        newFieldErrors.nationality = isAr ? "الجنسية مطلوبة" : "Nationality is required";
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        const firstSaveMsg = isAr
          ? "يرجى تعبئة جميع بياناتك الشخصية الأساسية قبل الحفظ."
          : "Please fill in all basic personal details before saving.";
        setFormError(firstSaveMsg);
        toast.error(firstSaveMsg);
        return;
      }

      // First save payload sending all 7 required snake_case fields
      const payload: PersonalInformation = {
        national_id: formValues.national_id.trim(),
        first_name_ar: formValues.first_name_ar.trim(),
        father_name_ar: formValues.father_name_ar.trim(),
        grandfather_name_ar: formValues.grandfather_name_ar.trim(),
        family_name_ar: formValues.family_name_ar.trim(),
        gender: formValues.gender,
        nationality: formValues.nationality.trim() || "ps",
      };

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
      // Partial update logic (data.personal_information !== null)
      // Diff changed fields against initial pi
      const changedFields: Partial<PersonalInformation> = {};
      let hasEmptyClearedField = false;

      const checkFieldChanged = (key: keyof PersonalInformation, val: string, initialVal: string) => {
        if (userEdits[key] !== undefined && userEdits[key] !== initialVal) {
          const trimmed = val.trim();
          if (!trimmed) {
            hasEmptyClearedField = true;
            newFieldErrors[key] = isAr
              ? "لا يمكن إرسال حقل فارغ. يرجى تعبئة الحقل أو تركه بدون تعديل."
              : "Cannot submit empty field. Please fill or leave unchanged.";
          } else {
            if (key === "national_id" && trimmed.length > 20) {
              newFieldErrors[key] = isAr ? "رقم الهوية يجب ألا يتجاوز 20 خانة" : "National ID cannot exceed 20 characters";
            } else if (key === "gender") {
              changedFields.gender = (trimmed === "female" ? "female" : "male");
            } else {
              changedFields[key] = trimmed;
            }
          }
        }
      };

      checkFieldChanged("first_name_ar", formValues.first_name_ar, pi?.first_name_ar ?? "");
      checkFieldChanged("father_name_ar", formValues.father_name_ar, pi?.father_name_ar ?? "");
      checkFieldChanged("grandfather_name_ar", formValues.grandfather_name_ar, pi?.grandfather_name_ar ?? "");
      checkFieldChanged("family_name_ar", formValues.family_name_ar, pi?.family_name_ar ?? "");
      checkFieldChanged("national_id", formValues.national_id, pi?.national_id ?? "");
      checkFieldChanged("gender", formValues.gender, pi?.gender ?? "male");
      checkFieldChanged("nationality", formValues.nationality, pi?.nationality ?? "ps");

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
    return <FormSkeleton fields={5} />;
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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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

        <ProfileInput
          id="national-id"
          label={t("nationalId")}
          value={formValues.national_id}
          error={fieldErrors.national_id}
          onChange={(value) => updateField("national_id", value)}
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
          label={t("nationality")}
          value={formValues.nationality}
          error={fieldErrors.nationality}
          onChange={(value) => updateField("nationality", value)}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isProfileLoaded || updateMutation.isPending}
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
  id: string;
  label: string;
  value: string;
  type?: string;
  error?: string;
  onChange: (value: string) => void;
};

function ProfileInput({
  id,
  label,
  value,
  type = "text",
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
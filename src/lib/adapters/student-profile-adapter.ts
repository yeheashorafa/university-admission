import type { AuthUser } from "@/services/auth.service";
import type { PersonalInformation, StudentProfile } from "@/services/profile.service";
import type { SocialInformation } from "@/services/social-information.service";

export type RawStudentProfile = Record<string, unknown>;

/**
 * Normalizes any student profile response shape from the backend into a standardized StudentProfile.
 * Handles nested or flat user, personal_information, and social_information structures without inventing fake data.
 */
export function normalizeStudentProfile(raw: unknown): StudentProfile {
  if (!raw || typeof raw !== "object") {
    return {};
  }

  const obj = raw as Record<string, unknown>;
  const user = (obj.user && typeof obj.user === "object" ? obj.user : {}) as Record<string, unknown>;
  const piRaw = (obj.personal_information && typeof obj.personal_information === "object"
    ? obj.personal_information
    : obj.personalInformation && typeof obj.personalInformation === "object"
    ? obj.personalInformation
    : null) as Record<string, unknown> | null;

  const socialRaw = (obj.social_information && typeof obj.social_information === "object"
    ? obj.social_information
    : obj.socialInformation && typeof obj.socialInformation === "object"
    ? obj.socialInformation
    : null) as Record<string, unknown> | null;

  const nationalId =
    (piRaw?.national_id as string) ??
    (obj.national_id as string) ??
    (obj.nationalId as string) ??
    (user.national_id as string) ??
    undefined;

  let personal_information: PersonalInformation | null = null;
  if (piRaw) {
    personal_information = {
      national_id: (piRaw.national_id as string) ?? nationalId,
      first_name_ar: (piRaw.first_name_ar as string) ?? undefined,
      father_name_ar: (piRaw.father_name_ar as string) ?? undefined,
      grandfather_name_ar: (piRaw.grandfather_name_ar as string) ?? undefined,
      family_name_ar: (piRaw.family_name_ar as string) ?? undefined,
      first_name_en: (piRaw.first_name_en as string) ?? null,
      father_name_en: (piRaw.father_name_en as string) ?? null,
      grandfather_name_en: (piRaw.grandfather_name_en as string) ?? null,
      family_name_en: (piRaw.family_name_en as string) ?? null,
      gender: (piRaw.gender as "male" | "female") ?? undefined,
      nationality: (piRaw.nationality as string) ?? undefined,
      date_of_birth:
        (piRaw.date_of_birth as string) ??
        (piRaw.birth_date as string) ??
        null,
      place_of_birth:
        (piRaw.place_of_birth as string) ??
        (piRaw.birth_place as string) ??
        null,
      official_address:
        (piRaw.official_address as string) ??
        (piRaw.address as string) ??
        null,
    };
  }

  return {
    id: (obj.id as string | number) ?? (user.id as string | number) ?? undefined,
    name: (obj.name as string) ?? (obj.full_name as string) ?? (obj.fullName as string) ?? (user.name as string) ?? undefined,
    fullName: (obj.fullName as string) ?? (obj.full_name as string) ?? (obj.name as string) ?? (user.name as string) ?? undefined,
    email: (obj.email as string) ?? (user.email as string) ?? undefined,
    phone: (obj.phone as string) ?? (user.phone as string) ?? undefined,
    nationalId,
    national_id: nationalId,
    city: (obj.city as string) ?? (socialRaw?.city as string) ?? undefined,
    address: (obj.address as string) ?? (piRaw?.official_address as string) ?? undefined,
    profileCompletion: typeof obj.profileCompletion === "number" ? obj.profileCompletion : undefined,
    personal_information,
    social_information: socialRaw ? (socialRaw as unknown as SocialInformation) : undefined,
    addresses: obj.addresses as Record<string, unknown> | undefined,
    emergency_contacts: obj.emergency_contacts as Record<string, unknown> | undefined,
    secondary_school_record: (obj.secondary_school_record ?? obj.secondarySchoolRecord) as Record<string, unknown> | null | undefined,
    secondary_school_records: (obj.secondary_school_records ?? obj.secondarySchoolRecords) as Record<string, unknown>[] | undefined,
    universityNumber: (obj.universityNumber as string) ?? (obj.university_number as string) ?? undefined,
  };
}

/**
 * Derives student display name following locale-based priority:
 * For 'en': EN parts -> AR parts -> profile/user names -> Fallback
 * For 'ar': AR parts -> EN parts -> profile/user names -> Fallback
 */
export function getStudentDisplayName(
  profile: StudentProfile | null | undefined,
  user: AuthUser | null | undefined,
  locale: string = "ar"
): string {
  const isAr = locale === "ar";
  const unavailableText = isAr ? "غير متوفر" : "Unavailable";

  const pi = profile?.personal_information;

  let arName = "";
  let enName = "";

  if (pi) {
    const arParts = [
      pi.first_name_ar,
      pi.father_name_ar,
      pi.grandfather_name_ar,
      pi.family_name_ar,
    ].filter((p): p is string => typeof p === "string" && p.trim().length > 0);
    
    if (arParts.length > 0) {
      arName = arParts.join(" ");
    }

    const enParts = [
      pi.first_name_en,
      pi.father_name_en,
      pi.grandfather_name_en,
      pi.family_name_en,
    ].filter((p): p is string => typeof p === "string" && p.trim().length > 0);
    
    if (enParts.length > 0) {
      enName = enParts.join(" ");
    }
  }

  // 1 & 2. Try Locale-preferred name parts first
  if (isAr) {
    if (arName) return arName;
    if (enName) return enName;
  } else {
    if (enName) return enName;
    if (arName) return arName;
  }

  // 3. profile.name
  if (profile?.name && profile.name.trim().length > 0) {
    return profile.name.trim();
  }

  // 4. profile.full_name
  const fullNameSnake = (profile as Record<string, unknown> | undefined)?.full_name;
  if (typeof fullNameSnake === "string" && fullNameSnake.trim().length > 0) {
    return fullNameSnake.trim();
  }

  // 5. profile.fullName
  if (profile?.fullName && profile.fullName.trim().length > 0) {
    return profile.fullName.trim();
  }

  // 6. user.name
  if (user?.name && user.name.trim().length > 0) {
    return user.name.trim();
  }

  // 7. localized fallback only if all missing
  return unavailableText;
}

export function getStudentNationalId({
  profile,
  user,
  socialInformation,
  formValues,
}: {
  profile?: unknown;
  user?: unknown;
  socialInformation?: unknown;
  formValues?: unknown;
} = {}): string | undefined {
  const p = profile as Record<string, unknown> | undefined;
  const pPi = p?.personal_information as Record<string, unknown> | undefined;
  const pUser = p?.user as Record<string, unknown> | undefined;

  const u = user as Record<string, unknown> | undefined;
  const uUser = u?.user as Record<string, unknown> | undefined;

  const s = socialInformation as Record<string, unknown> | undefined;
  const f = formValues as Record<string, unknown> | undefined;

  const candidates = [
    pPi?.national_id,
    p?.national_id,
    p?.nationalId,
    pUser?.national_id,
    pUser?.nationalId,
    u?.national_id,
    u?.nationalId,
    uUser?.national_id,
    uUser?.nationalId,
    s?.national_id,
    s?.nationalId,
    f?.national_id,
    f?.nationalId,
  ];

  for (const val of candidates) {
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (
        trimmed &&
        trimmed !== "غير متوفر" &&
        trimmed !== "Unavailable"
      ) {
        return trimmed;
      }
    } else if (typeof val === "number") {
      return String(val).trim();
    }
  }

  return undefined;
}

/**
 * Returns structured personal information from profile or null.
 */
export function getPersonalInformation(
  profile: StudentProfile | null | undefined
): PersonalInformation | null {
  return profile?.personal_information ?? null;
}

/**
 * Returns social information if embedded inside student profile response.
 */
export function getSocialInformationFromProfile(
  profile: StudentProfile | null | undefined
): SocialInformation | null {
  if (!profile) return null;
  const embedded = profile.social_information;
  if (embedded && typeof embedded === "object" && Object.keys(embedded).length > 0) {
    return embedded;
  }
  return null;
}

/**
 * Verifies if student has a secondary school / Tawjihi record in profile.
 */
export function hasTawjihiRecord(
  profile: StudentProfile | null | undefined
): boolean {
  if (!profile) return false;
  if (
    profile.secondary_school_record &&
    typeof profile.secondary_school_record === "object" &&
    Object.keys(profile.secondary_school_record).length > 0
  ) {
    return true;
  }
  if (
    Array.isArray(profile.secondary_school_records) &&
    profile.secondary_school_records.length > 0
  ) {
    return true;
  }
  return false;
}

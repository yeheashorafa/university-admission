export function getProgramLabel(app: Record<string, unknown>, isAr: boolean): string {
  const selectedProgram = app.selectedProgram;
  if (typeof selectedProgram === "string" && selectedProgram.trim()) {
    return selectedProgram;
  }

  const programName = app.program_name;
  if (typeof programName === "string" && programName.trim()) {
    return programName;
  }

  const program = app.program;

  if (typeof program === "string" && program.trim()) {
    return program;
  }

  if (program && typeof program === "object") {
    const p = program as Record<string, unknown>;

    const nameAr = typeof p.name_ar === "string" ? p.name_ar : "";
    const nameEn = typeof p.name_en === "string" ? p.name_en : "";
    const name = typeof p.name === "string" ? p.name : "";

    return (
      (isAr ? nameAr || nameEn || name : nameEn || nameAr || name) ||
      "برنامج غير محدد"
    );
  }

  return "برنامج غير محدد";
}

export function extractStudentName(app: Record<string, unknown>): string {
  const direct =
    typeof app.studentName === "string"
      ? app.studentName
      : typeof app.student_name === "string"
        ? app.student_name
        : "";

  if (direct.trim()) return direct;

  const objectsToSearch = [
    app.applicant,
    app.student,
    app.user,
    app.profile,
  ].filter(Boolean) as Record<string, unknown>[];

  for (const obj of objectsToSearch) {
    if (typeof obj.name === "string" && obj.name) return obj.name;
    if (typeof obj.name_ar === "string" && obj.name_ar) return obj.name_ar;
    if (typeof obj.full_name === "string" && obj.full_name) return obj.full_name;
    
    const pi = obj.personal_information as Record<string, unknown> | undefined;
    if (pi) {
      const parts = [
        pi.first_name_ar,
        pi.father_name_ar,
        pi.grandfather_name_ar,
        pi.family_name_ar
      ].filter(Boolean) as string[];
      if (parts.length > 0) return parts.join(" ");
    }
  }

  const piTop = app.personal_information as Record<string, unknown> | undefined;
  if (piTop) {
    const parts = [
      piTop.first_name_ar,
      piTop.father_name_ar,
      piTop.grandfather_name_ar,
      piTop.family_name_ar
    ].filter(Boolean) as string[];
    if (parts.length > 0) return parts.join(" ");
  }

  return "غير متوفر";
}

export function extractNationalId(app: Record<string, unknown>): string {
  if (typeof app.nationalId === "string" && app.nationalId) return app.nationalId;
  if (typeof app.national_id === "string" && app.national_id) return app.national_id;

  const objectsToSearch = [
    app.applicant,
    app.student,
    app.user,
    app.profile,
  ].filter(Boolean) as Record<string, unknown>[];

  for (const obj of objectsToSearch) {
    if (typeof obj.national_id === "string" && obj.national_id) return obj.national_id;
    const pi = obj.personal_information as Record<string, unknown> | undefined;
    if (pi && typeof pi.national_id === "string" && pi.national_id) return pi.national_id;
    const prof = obj.profile as Record<string, unknown> | undefined;
    if (prof && typeof prof.national_id === "string" && prof.national_id) return prof.national_id;
    if (prof) {
        const profPi = prof.personal_information as Record<string, unknown> | undefined;
        if (profPi && typeof profPi.national_id === "string" && profPi.national_id) return profPi.national_id;
    }
  }

  const piTop = app.personal_information as Record<string, unknown> | undefined;
  if (piTop && typeof piTop.national_id === "string" && piTop.national_id) return piTop.national_id;

  return "—";
}

export function formatDateTime(value: unknown, locale: string = "ar"): string {
  if (!value) return "—";
  
  try {
    const date = new Date(value as string);
    if (isNaN(date.getTime())) return "—";
    
    // For Arabic, prefer readable Arabic with Latin digits
    const actualLocale = locale.startsWith("ar") ? "ar-EG-u-nu-latn" : locale;
    
    return new Intl.DateTimeFormat(actualLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "—";
  }
}

export function getApplicationNumber(app: Record<string, unknown>): string {
  return (
    (typeof app.applicationNo === "string" && app.applicationNo) ||
    (typeof app.application_number === "string" && app.application_number) ||
    (typeof app.application_no === "string" && app.application_no) ||
    (app.id ? `APP-${String(app.id)}` : "—")
  );
}

export function toDisplayText(value: unknown, fallback = "—"): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
}

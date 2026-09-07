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

export function getApplicantLabel(app: Record<string, unknown>): string {
  const direct =
    typeof app.studentName === "string"
      ? app.studentName
      : typeof app.student_name === "string"
        ? app.student_name
        : "";

  if (direct.trim()) return direct;

  const applicant = app.applicant ?? app.student ?? app.user;

  if (applicant && typeof applicant === "object") {
    const a = applicant as Record<string, unknown>;

    const name = typeof a.name === "string" ? a.name : "";
    const nameAr = typeof a.name_ar === "string" ? a.name_ar : "";
    const fullName = typeof a.full_name === "string" ? a.full_name : "";
    const email = typeof a.email === "string" ? a.email : "";

    return name || nameAr || fullName || email || "طالب غير محدد";
  }

  return "طالب غير محدد";
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

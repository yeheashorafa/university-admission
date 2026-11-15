import type { AdminProgramEditor } from "./admin-programs.data";

export function mapAdminProgram(
  value: unknown,
  locale: string,
  facultyOptions: unknown[] = [],
): AdminProgramEditor | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const sections = ["fees", "admission_thresholds", "links", "career_opportunities", "objectives", "graduate_outcomes", "courses"];
  if (!sections.every((section) => Array.isArray(item[section]))) return null;
  const faculty =
    (item.faculty as Record<string, unknown> | undefined) ??
    facultyOptions
      .map((option) => option as Record<string, unknown>)
      .find((option) => String(option.id) === String(item.faculty_id));

  return {
    id: String(item.id),
    nameAr: String(item.name_ar || item.name || item.title || ""),
    nameEn: String(item.name_en || item.name || item.title || ""),
    descriptionAr: String(item.description_ar || ""),
    descriptionEn: String(item.description_en || ""),
    facultyId: item.faculty_id == null ? "" : String(item.faculty_id),
    facultyName: String(
      locale === "ar"
        ? faculty?.name_ar || faculty?.name_en || item.faculty_name || ""
        : faculty?.name_en || faculty?.name_ar || item.faculty_name || "",
    ),
    isActive: item.is_active === true,
    minimumAverage:
      item.minimum_average == null ? null : Number(item.minimum_average),
    details: {
      whyStudyAr: String(item.why_study_ar ?? ""),
      whyStudyEn: String(item.why_study_en ?? ""),
      degreeAr: String(item.degree_level_ar ?? ""),
      degreeEn: String(item.degree_level_en ?? ""),
      durationYears:
        item.duration_years == null ? null : Number(item.duration_years),
      fees: Array.isArray(item.fees)
        ? (item.fees as AdminProgramEditor["details"]["fees"])
        : [],
      admissionThresholds: Array.isArray(item.admission_thresholds)
        ? (item.admission_thresholds as AdminProgramEditor["details"]["admissionThresholds"])
        : [],
      links: Array.isArray(item.links)
        ? (item.links as AdminProgramEditor["details"]["links"])
        : [],
      careerOpportunities: Array.isArray(item.career_opportunities)
        ? (item.career_opportunities as AdminProgramEditor["details"]["careerOpportunities"])
        : [],
      objectives: Array.isArray(item.objectives)
        ? (item.objectives as AdminProgramEditor["details"]["objectives"])
        : [],
      graduateOutcomes: Array.isArray(item.graduate_outcomes)
        ? (item.graduate_outcomes as AdminProgramEditor["details"]["graduateOutcomes"])
        : [],
      courses: Array.isArray(item.courses)
        ? (item.courses as AdminProgramEditor["details"]["courses"])
        : [],
    },
  };
}

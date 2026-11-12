import type {
  PublicFaculty,
  PublicProgram,
} from "@/services/public-catalog.service";

export type FacultyViewModel = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

export type ProgramViewModel = {
  id: string;
  name: string;
  description: string;
  minimumAverage: number;
  branches: string[];
  isActive: boolean;
  degree?: string;
  durationYears?: number;
  facultyName?: string;
};

export function mapFacultyToViewModel(
  faculty: PublicFaculty,
  locale: string
): FacultyViewModel {
  const name =
    locale === "ar"
      ? faculty.name_ar || faculty.name_en || faculty.name || ""
      : faculty.name_en || faculty.name_ar || faculty.name || "";

  const description =
    locale === "ar"
      ? faculty.description_ar || faculty.description_en || faculty.description || ""
      : faculty.description_en || faculty.description_ar || faculty.description || "";

  return {
    id: String(faculty.id),
    name: String(name),
    description: String(description),
    isActive: faculty.is_active ?? true,
  };
}

export function mapProgramToViewModel(
  program: PublicProgram,
  locale: string
): ProgramViewModel {
  const name =
    locale === "ar"
      ? program.name_ar || program.name_en || program.name || ""
      : program.name_en || program.name_ar || program.name || "";

  const description =
    locale === "ar"
      ? program.description_ar || program.description_en || program.description || ""
      : program.description_en || program.description_ar || program.description || "";

  const rawBranches = program.branches as unknown;
  let branchesList: unknown[] = [];

  if (Array.isArray(rawBranches)) {
    branchesList = rawBranches;
  } else if (typeof rawBranches === "string" && rawBranches.trim()) {
    try {
      const parsed = JSON.parse(rawBranches);
      branchesList = Array.isArray(parsed)
        ? parsed
        : rawBranches.split(",").map((s: string) => s.trim());
    } catch {
      branchesList = rawBranches.split(",").map((s: string) => s.trim());
    }
  }

  const safeBranchesList = Array.isArray(branchesList) ? branchesList : [];
  const minAvg = Number(program.minimum_average ?? program.minGPA ?? program.minAverage ?? 0);

  const facultyObj = program.faculty as PublicFaculty | undefined;
  const facultyName = facultyObj
    ? String(
        locale === "ar"
          ? facultyObj.name_ar || facultyObj.name_en || facultyObj.name || ""
          : facultyObj.name_en || facultyObj.name_ar || facultyObj.name || ""
      )
    : undefined;

  const mappedBranches = safeBranchesList
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        const bObj = item as { name_ar?: string; name_en?: string; name?: string };
        return locale === "ar"
          ? bObj.name_ar || bObj.name_en || bObj.name || ""
          : bObj.name_en || bObj.name_ar || bObj.name || "";
      }
      return String(item);
    })
    .filter(Boolean);

  return {
    id: String(program.id),
    name: String(name),
    description: String(description),
    minimumAverage: minAvg,
    branches: mappedBranches,
    isActive: program.is_active ?? true,
    degree: program.degree ? String(program.degree) : undefined,
    durationYears:
      typeof (program.duration_years ?? program.durationYears) === "number"
        ? Number(program.duration_years ?? program.durationYears)
        : undefined,
    facultyName,
  };
}

export type AdminProgramStatus = "active" | "inactive" | "closed";
export type AcademicBranch = "scientific" | "literary" | "industrial";

export type AdminProgram = {
  id: string;
  title: string;
  faculty: string;
  degree: string;
  duration: string;
  status: AdminProgramStatus;
  minimumRate: number;
  capacity: number;
  applicationsCount: number;
  acceptedCount: number;
  branches: AcademicBranch[];
  facultyId?: string | number;
};

export type AdminProgramEditor = {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  facultyId: string;
  facultyName: string;
  isActive: boolean;
  minimumAverage: number | null;
  details: {
    whyStudyAr: string;
    whyStudyEn: string;
    degreeAr: string;
    degreeEn: string;
    durationYears: number | null;
    fees: Array<{
      admission_cycle_id: number | null;
      admission_cycle?: {
        id: number;
        name?: string;
        academic_year?: string;
      } | null;
      price_per_hour_dinar: number | string;
      credit_hours: number;
      source_url?: string | null;
    }>;
    admissionThresholds: Array<{
      admission_cycle_id: number | null;
      branch_id: number;
      branch?: { name_ar?: string; name_en?: string };
      gender: "male" | "female";
      min_average_percent: number | string;
      source_url?: string | null;
    }>;
    links: Array<{
      admission_cycle_id: number | null;
      kind: string;
      label_ar?: string;
      label_en?: string;
      url: string;
      sort_order: number;
      is_active?: boolean;
    }>;
    careerOpportunities: Array<{
      ar: string;
      en?: string | null;
      sort_order?: number;
    }>;
    objectives: Array<{ ar: string; en?: string | null; sort_order?: number }>;
    graduateOutcomes: Array<{
      ar: string;
      en?: string | null;
      sort_order?: number;
    }>;
    courses: Array<{
      code?: string | null;
      name_ar: string;
      name_en?: string | null;
      credit_hours: number;
      semester?: string | null;
      level?: string | null;
      course_type?: string | null;
      sort_order?: number;
    }>;
  };
};

export type FacultyStatus = "active" | "inactive";

export type Faculty = {
  id: string | number;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  is_active: boolean;
};

export type FacultyFormValues = {
  id?: string | number;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  is_active: boolean;
};

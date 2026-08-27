export type DepartmentStatus = "active" | "inactive";

export type Department = {
  id: string | number;
  faculty_id: string | number;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  is_active: boolean;
  facultyName?: string;
};

export type DepartmentFormValues = {
  id?: string | number;
  faculty_id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  is_active: boolean;
};

export type ApplicationTypeStatus = "active" | "inactive";

export type ApplicationType = {
  id: string | number;
  code: string;
  name_en: string;
  name_ar: string;
  requires_department_head_approval: boolean;
  is_active: boolean;
};

export type ApplicationTypeFormValues = {
  id?: string | number;
  code: string;
  name_en: string;
  name_ar: string;
  requires_department_head_approval: boolean;
  is_active: boolean;
};

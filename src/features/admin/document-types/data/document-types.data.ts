export type DocumentType = {
  id: string | number;
  name: string;
  display_name_en: string;
  display_name_ar: string;
  description?: string;
  is_required: boolean;
};

export type DocumentTypeFormValues = {
  id?: string | number;
  name: string;
  display_name_en: string;
  display_name_ar: string;
  description?: string;
  is_required: boolean;
};

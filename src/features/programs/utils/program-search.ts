import type { FacultyId } from "../data/programs.data";

export const facultySearchKeywords: Record<FacultyId, string> = {
  informationTechnology:
    "information technology it computer حاسوب تكنولوجيا معلومات كلية تكنولوجيا المعلومات",
  engineering: "engineering engineer هندسة مهندس كلية الهندسة",
  medicine: "medicine medical طب كلية الطب",
  healthSciences:
    "health sciences nursing medical laboratory علوم صحية تمريض مختبرات كلية العلوم الصحية",
  science: "science biology mathematics علوم احياء رياضيات كلية العلوم",
  education: "education teacher تعليم تربية معلم كلية التربية",
  shariaLaw: "sharia law islamic شريعة قانون كلية الشريعة والقانون",
  business:
    "business economics administration accounting اقتصاد ادارة محاسبة كلية الاقتصاد والعلوم الادارية",
};

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "");
}
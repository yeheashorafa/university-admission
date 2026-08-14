export type OptionItem = {
  id: string;
  nameAr: string;
  nameEn: string;
};

export const governorates: OptionItem[] = [
  { id: "gaza", nameAr: "غزة", nameEn: "Gaza" },
  { id: "north_gaza", nameAr: "شمال غزة", nameEn: "North Gaza" },
  { id: "khan_younis", nameAr: "خانيونس", nameEn: "Khan Younis" },
  { id: "rafah", nameAr: "رفح", nameEn: "Rafah" },
  { id: "middle_area", nameAr: "الوسطى", nameEn: "Middle Area" },
];

export const citiesByGovernorate: Record<string, OptionItem[]> = {
  gaza: [
    { id: "gaza_city", nameAr: "غزة", nameEn: "Gaza City" },
    { id: "al_zahra", nameAr: "الزهراء", nameEn: "Al-Zahra" },
  ],
  north_gaza: [
    { id: "beit_lahia", nameAr: "بيت لاهيا", nameEn: "Beit Lahia" },
    { id: "beit_hanoun", nameAr: "بيت حانون", nameEn: "Beit Hanoun" },
  ],
  khan_younis: [
    { id: "khan_younis_city", nameAr: "خانيونس", nameEn: "Khan Younis City" },
    { id: "new_abasan", nameAr: "عبسان الجديدة", nameEn: "New Abasan" },
    { id: "big_abasan", nameAr: "عبسان الكبيرة", nameEn: "Big Abasan" },
    { id: "bani_suheila", nameAr: "بني سهيلا", nameEn: "Bani Suheila" },
    { id: "al_qarara", nameAr: "القرارة", nameEn: "Al-Qarara" },
    { id: "ma_an", nameAr: "معن", nameEn: "Ma'an" },
    { id: "al_fakhari", nameAr: "الفخاري", nameEn: "Al-Fakhari" },
  ],
  rafah: [
    { id: "rafah_city", nameAr: "رفح", nameEn: "Rafah City" },
  ],
  middle_area: [
    { id: "deir_al_balah", nameAr: "دير البلح", nameEn: "Deir Al-Balah" },
  ],
};

export const neighborhoodsByCity: Record<string, OptionItem[]> = {
  gaza_city: [
    { id: "sheikh_radwan", nameAr: "الشيخ رضوان", nameEn: "Sheikh Radwan" },
    { id: "remal_north", nameAr: "الرمال الشمالي", nameEn: "Northern Remal" },
    { id: "remal_south", nameAr: "الرمال الجنوبي", nameEn: "Southern Remal" },
    { id: "shati_camp", nameAr: "معسكر الشاطئ", nameEn: "Al-Shati Camp" },
    { id: "tal_al_hawa", nameAr: "تل الهوا", nameEn: "Tal Al-Hawa" },
    { id: "al_karama", nameAr: "أبراج الكرامة", nameEn: "Al-Karama Towers" },
    { id: "amer_project", nameAr: "مشروع عامر", nameEn: "Amer Project" },
  ],
  al_zahra: [
    { id: "zahra_block_1", nameAr: "الحي الأول", nameEn: "Block 1" },
    { id: "zahra_block_2", nameAr: "الحي الثاني", nameEn: "Block 2" },
  ],
  beit_lahia: [
    { id: "sheikh_zayed", nameAr: "مدينة الشيخ زايد", nameEn: "Sheikh Zayed City" },
    { id: "fardous", nameAr: "حي الفردوس", nameEn: "Al-Fardous" },
  ],
  beit_hanoun: [
    { id: "amal_bh", nameAr: "حي الأمل", nameEn: "Al-Amal" },
    { id: "boura", nameAr: "البورة", nameEn: "Al-Boura" },
  ],
  khan_younis_city: [
    { id: "katiba", nameAr: "الكتيبة", nameEn: "Al-Katiba" },
    { id: "amal_ky", nameAr: "حي الأمل", nameEn: "Al-Amal" },
  ],
  deir_al_balah: [
    { id: "bassa", nameAr: "البصة", nameEn: "Al-Bassa" },
    { id: "hikr", nameAr: "حكر الجامع", nameEn: "Hikr Al-Jame'" },
  ],
};

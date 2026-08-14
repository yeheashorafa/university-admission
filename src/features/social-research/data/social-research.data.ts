export const familyIncomeRanges = [
  "less_than_500",
  "500_1000",
  "1000_1500",
  "1500_2000",
  "more_than_2000",
] as const;

export const housingTypes = [
  "owned",
  "rented",
  "family_house",
  "temporary",
] as const;

export const socialStatuses = [
  "single",
  "married",
  "orphan",
  "special_case",
] as const;

export type FamilyIncomeRange = (typeof familyIncomeRanges)[number];
export type HousingType = (typeof housingTypes)[number];
export type SocialStatus = (typeof socialStatuses)[number];

export type SocialResearchFormValues = {
  guardianName: string;
  guardianPhone: string;
  familyMembersCount: string;
  familyIncomeRange: FamilyIncomeRange;
  housingType: HousingType;
  socialStatus: SocialStatus;
  hasScholarshipRequest: boolean;
  notes: string;
};
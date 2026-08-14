export type LegalPolicyStatus = "published" | "draft" | "archived";

export type LegalPolicy = {
  id: string;
  title: string;
  description: string;
  status: LegalPolicyStatus;
  version: string;
  lastUpdated: string;
  updatedBy: string;
  content: string;
};

export const legalPoliciesMock: LegalPolicy[] = [
  {
    id: "terms",
    title: "Terms and Conditions",
    description:
      "Defines applicant responsibilities, system usage rules, and admission portal terms.",
    status: "published",
    version: "v1.4",
    lastUpdated: "Oct 12, 2026",
    updatedBy: "Ahmed Mahmoud",
    content:
      "Applicants must provide accurate and complete information. The university reserves the right to verify all submitted data and documents before making an admission decision.",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    description:
      "Explains how applicant data is collected, processed, protected, and retained.",
    status: "published",
    version: "v1.2",
    lastUpdated: "Sep 28, 2026",
    updatedBy: "Mona Saleh",
    content:
      "The admission portal collects personal, academic, and contact information required to process university applications. Data is handled securely and used only for admission-related purposes.",
  },
  {
    id: "admission",
    title: "Admission Policy",
    description:
      "Outlines admission rules, eligibility conditions, program preferences, and decision stages.",
    status: "draft",
    version: "v2.0",
    lastUpdated: "Oct 18, 2026",
    updatedBy: "Admissions Office",
    content:
      "Admission decisions are based on academic eligibility, program capacity, document verification, and any additional requirements determined by the university.",
  },
  {
    id: "documents",
    title: "Document Verification Policy",
    description:
      "Defines how uploaded documents are checked using AI-assisted and manual review.",
    status: "published",
    version: "v1.1",
    lastUpdated: "Oct 05, 2026",
    updatedBy: "Document Verification Team",
    content:
      "Uploaded documents may be reviewed automatically and manually. Applicants may be requested to re-upload unclear, incomplete, or suspicious documents.",
  },
];
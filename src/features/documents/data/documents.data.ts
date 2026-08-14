export type DocumentStatus = "checking" | "verified" | "needs_reupload";

export type RequiredDocument = {
  id: "identity" | "personal-photo" | "tawjihi-certificate";
  title: string;
  description: string;
  status: DocumentStatus;
  preview?: string;
  required?: boolean;
};

export const documentsMock: RequiredDocument[] = [
  {
    id: "identity",
    title: "Personal ID",
    description:
      "A clear image of your ID card or passport. Upload both sides if required.",
    status: "checking",
    preview: "/images/placeholders/id-card-placeholder.png",
    required: true,
  },
  {
    id: "personal-photo",
    title: "Personal Photo",
    description: "A recent personal photo with a white or blue background.",
    status: "verified",
    preview: "/images/placeholders/profile-placeholder.png",
    required: true,
  },
  {
    id: "tawjihi-certificate",
    title: "High School Certificate",
    description:
      "The original certified transcript issued by the Ministry of Education.",
    status: "needs_reupload",
    required: true,
  },
];

export const uploadGuidelines = [
  "lighting",
  "corners",
  "readable",
  "scanner",
];
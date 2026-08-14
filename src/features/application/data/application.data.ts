import {
  Building2,
  Computer,
  HeartPulse,
  Landmark,
  BookOpen,
  Cpu,
  type LucideIcon,
} from "lucide-react";

export type ApplicationStepStatus = "completed" | "active" | "pending";

export type ApplicationStep = {
  id: number;
  title: string;
  status: ApplicationStepStatus;
};

export type ProgramOption = {
  id: string;
  title: string;
  faculty: string;
  minimumRate?: number;
  eligible: boolean;
  icon: LucideIcon;
};

export const applicationSteps: ApplicationStep[] = [
  { id: 1, title: "Qualification Data", status: "active" },
  { id: 2, title: "Admission Type", status: "pending" },
  { id: 3, title: "Main / Tawjihi Data", status: "pending" },
  { id: 4, title: "Basic Personal Data", status: "pending" },
  { id: 5, title: "Guardian Data", status: "pending" },
  { id: 6, title: "Address & Contact Data", status: "pending" },
  { id: 7, title: "Student Preferences", status: "pending" },
  { id: 8, title: "Student Photo", status: "pending" },
  { id: 9, title: "Application Documents", status: "pending" },
  { id: 10, title: "Full Application Review", status: "pending" },
  { id: 11, title: "Final Confirmation", status: "pending" },
];

export const programOptions: ProgramOption[] = [
  {
    id: "computer-engineering",
    title: "Computer Engineering",
    faculty: "Faculty of Engineering",
    eligible: true,
    icon: Computer,
  },
  {
    id: "medicine",
    title: "Medicine and Surgery",
    faculty: "Faculty of Medicine",
    eligible: true,
    icon: HeartPulse,
  },
  {
    id: "software-engineering",
    title: "Software Engineering",
    faculty: "Faculty of Engineering",
    eligible: true,
    icon: Cpu,
  },
  {
    id: "data-ai",
    title: "Data Science and Artificial Intelligence",
    faculty: "Faculty of Information Technology",
    eligible: true,
    icon: Computer,
  },
  {
    id: "accounting",
    title: "Accounting",
    faculty: "Faculty of Commerce",
    eligible: true,
    icon: Landmark,
  },
  {
    id: "business-administration",
    title: "Business Administration",
    faculty: "Faculty of Commerce",
    eligible: true,
    icon: Building2,
  },
  {
    id: "english",
    title: "English Language and Literature",
    faculty: "Faculty of Arts",
    eligible: true,
    icon: BookOpen,
  },
  {
    id: "architecture",
    title: "Architecture",
    faculty: "Faculty of Engineering",
    minimumRate: 96,
    eligible: false,
    icon: Landmark,
  },
];
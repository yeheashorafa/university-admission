export type AdminProgramStatus = "active" | "inactive" | "closed";
export type AcademicBranch = "scientific" | "literary" | "industrial";

export type AdminProgram = {
  id: string;
  title: string;
  faculty: string;
  degree: string;
  duration: string;
  status: AdminProgramStatus;
  minimumRate: number;
  capacity: number;
  applicationsCount: number;
  acceptedCount: number;
  branches: AcademicBranch[];
};

export const adminProgramsMock: AdminProgram[] = [
  {
    id: "software-engineering",
    title: "Software Engineering",
    faculty: "Faculty of Information Technology",
    degree: "Bachelor",
    duration: "4 years",
    status: "active",
    minimumRate: 80,
    capacity: 120,
    applicationsCount: 248,
    acceptedCount: 64,
    branches: ["scientific", "industrial"],
  },
  {
    id: "medicine",
    title: "Medicine and Surgery",
    faculty: "Faculty of Medicine",
    degree: "Bachelor",
    duration: "6 years",
    status: "active",
    minimumRate: 95,
    capacity: 80,
    applicationsCount: 392,
    acceptedCount: 42,
    branches: ["scientific"],
  },
  {
    id: "data-ai",
    title: "Data Science and Artificial Intelligence",
    faculty: "Faculty of Information Technology",
    degree: "Bachelor",
    duration: "4 years",
    status: "active",
    minimumRate: 85,
    capacity: 90,
    applicationsCount: 174,
    acceptedCount: 38,
    branches: ["scientific"],
  },
  {
    id: "accounting",
    title: "Accounting",
    faculty: "Faculty of Commerce",
    degree: "Bachelor",
    duration: "4 years",
    status: "inactive",
    minimumRate: 70,
    capacity: 150,
    applicationsCount: 88,
    acceptedCount: 21,
    branches: ["scientific", "literary"],
  },
  {
    id: "english",
    title: "English Language and Literature",
    faculty: "Faculty of Arts",
    degree: "Bachelor",
    duration: "4 years",
    status: "closed",
    minimumRate: 65,
    capacity: 100,
    applicationsCount: 76,
    acceptedCount: 35,
    branches: ["literary"],
  },
];

export const adminProgramStatsMock = [
  {
    key: "totalPrograms",
    value: "32",
  },
  {
    key: "activePrograms",
    value: "24",
  },
  {
    key: "closedPrograms",
    value: "5",
  },
  {
    key: "totalCapacity",
    value: "2,840",
  },
] as const;

export const facultiesMock = [
  "informationTechnology",
  "medicine",
  "engineering",
  "commerce",
  "arts",
  "education",
  "nursing",
] as const;
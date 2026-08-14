export type AdmissionCycleStatus = "open" | "upcoming" | "closed" | "archived";

export type AdmissionCycle = {
  id: string;
  name: string;
  academicYear: string;
  semester: string;
  status: AdmissionCycleStatus;
  applicationsOpenAt: string;
  applicationsCloseAt: string;
  paymentDeadline: string;
  capacity: number;
  applicationsCount: number;
  acceptedCount: number;
  notes: string;
};

export const admissionCyclesMock: AdmissionCycle[] = [];

export const admissionCycleStatsMock = [
  {
    key: "activeCycle",
    value: "1",
  },
  {
    key: "upcomingCycles",
    value: "1",
  },
  {
    key: "totalApplications",
    value: "1,248",
  },
  {
    key: "currentCapacity",
    value: "2,840",
  },
] as const;
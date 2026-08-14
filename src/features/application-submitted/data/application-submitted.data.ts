export const submittedApplicationMock = {
  applicationNo: "APP-2026-8932",
  submittedAt: "October 18, 2026 - 11:35 AM",
  studentName: "Ahmed Mohammad Hassan",
  selectedProgram: "Software Engineering",
  faculty: "Faculty of Information Technology",
  status: "Under Review",
};

export const nextStepsMock = [
  {
    id: "documents",
  },
  {
    id: "verification",
  },
  {
    id: "decision",
  },
  {
    id: "payment",
  },
] as const;
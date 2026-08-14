export const studentMock = {
  name: "Ahmed Mohammad",
  role: "Applicant Student",
  profileCompletion: 75,
};

export const currentApplicationMock = {
  id: "APP-2026-8932",
  title: "Bachelor Admission - Software Engineering",
  status: "Under Review",
  submittedAt: "October 15, 2026",
};

export const admissionTimelineMock = [
  {
    title: "Application Submitted",
    description: "Completed - October 15, 2026",
    status: "completed",
  },
  {
    title: "Document Review",
    description: "In progress - Expected: October 20",
    status: "active",
  },
  {
    title: "Personal Interview",
    description: "Coming soon",
    status: "pending",
  },
  {
    title: "Admission Decision",
    description: "Coming soon",
    status: "pending",
  },
] as const;

export const notificationsMock = [
  {
    id: "1",
    title: "Reminder: please upload the certified high school certificate.",
    time: "2 hours ago",
    variant: "danger",
  },
  {
    id: "2",
    title: "Your registration fee payment has been received successfully.",
    time: "Yesterday",
    variant: "info",
  },
  {
    id: "3",
    title: "Welcome to the smart admission system.",
    time: "October 15",
    variant: "muted",
  },
] as const;
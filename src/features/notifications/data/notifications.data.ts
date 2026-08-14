export type StudentNotificationType =
  | "document"
  | "status"
  | "payment"
  | "admission"
  | "general";

export type StudentNotificationStatus = "unread" | "read";

export type StudentNotification = {
  id: string;
  title: string;
  message: string;
  type: StudentNotificationType;
  status: StudentNotificationStatus;
  time: string;
  actionLabel?: string;
  actionHref?: string;
};

export const studentNotificationsMock: StudentNotification[] = [
  {
    id: "1",
    title: "Application Submitted Successfully",
    message:
      "Your admission application (APP-2026-8001) has been received and queued for processing.",
    type: "status",
    status: "read",
    time: "Today, 08:30 AM",
    actionLabel: "Track Status",
    actionHref: "/status",
  },
  {
    id: "2",
    title: "AI Verification Needs Manual Review",
    message:
      "Automated AI verification for high school transcript scan was below threshold. Application moved to employee manual review.",
    type: "document",
    status: "unread",
    time: "Today, 09:15 AM",
    actionLabel: "View Details",
    actionHref: "/status",
  },
  {
    id: "3",
    title: "Document Re-upload Requested",
    message:
      "Your personal ID image scan was unclear. Please upload a clearer copy to finalize verification.",
    type: "document",
    status: "unread",
    time: "Today, 10:20 AM",
    actionLabel: "Upload Document",
    actionHref: "/documents",
  },
  {
    id: "4",
    title: "Payment Step Required",
    message:
      "Your application has been approved by the department head. Please complete the admission fee payment.",
    type: "payment",
    status: "read",
    time: "Yesterday, 02:45 PM",
    actionLabel: "Pay Now",
    actionHref: "/payment",
  },
  {
    id: "5",
    title: "Social Research Form Required",
    message:
      "Your payment was verified and university number issued. Please fill out the social research form.",
    type: "admission",
    status: "read",
    time: "Yesterday, 04:10 PM",
    actionLabel: "Fill Research Form",
    actionHref: "/social-research",
  },
  {
    id: "6",
    title: "Admission Application Completed",
    message:
      "Congratulations! Your application is fully completed and your university number is active.",
    type: "admission",
    status: "read",
    time: "Oct 15, 2026",
    actionLabel: "View Profile",
    actionHref: "/profile",
  },
];

export const notificationStatsMock = [
  {
    key: "allNotifications",
    value: "12",
  },
  {
    key: "unread",
    value: "2",
  },
  {
    key: "documentRequests",
    value: "1",
  },
  {
    key: "admissionUpdates",
    value: "4",
  },
];
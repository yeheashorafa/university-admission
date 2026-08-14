export type NotificationType =
  | "document"
  | "status"
  | "payment"
  | "admission"
  | "general";

export type NotificationAudience = "single_student" | "all_applicants" | "filtered_group";

export type AdminNotificationStatus = "sent" | "scheduled" | "draft";

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  audience: string;
  status: AdminNotificationStatus;
  sentAt: string;
};

export const adminNotificationsMock: AdminNotification[] = [
  {
    id: "1",
    title: "Document Re-upload Required",
    message:
      "Please re-upload a clearer image of your personal ID to continue the review process.",
    type: "document",
    audience: "Khaled Ibrahim Khalil",
    status: "sent",
    sentAt: "Today, 10:20 AM",
  },
  {
    id: "2",
    title: "Application Under Review",
    message:
      "Your admission application is currently being reviewed by the admissions team.",
    type: "status",
    audience: "All applicants under review",
    status: "sent",
    sentAt: "Yesterday, 02:45 PM",
  },
  {
    id: "3",
    title: "Payment Step Available",
    message:
      "Your documents have been verified. You can now proceed to the admission fee payment step.",
    type: "payment",
    audience: "Verified applicants",
    status: "scheduled",
    sentAt: "Tomorrow, 09:00 AM",
  },
  {
    id: "4",
    title: "Welcome to Admission Portal",
    message:
      "Welcome to the Islamic University of Gaza admission portal. Please complete your profile to continue.",
    type: "general",
    audience: "New applicants",
    status: "draft",
    sentAt: "Not sent yet",
  },
];

export const notificationTemplates = [
  {
    id: "document-reupload",
    title: "Document Re-upload Required",
    message:
      "Please re-upload a clearer copy of the required document to continue the review process.",
  },
  {
    id: "application-approved",
    title: "Application Approved",
    message:
      "Congratulations. Your application has been approved. Please follow the next steps in your dashboard.",
  },
  {
    id: "payment-reminder",
    title: "Payment Reminder",
    message:
      "Please complete the admission fee payment before the deadline to avoid delays.",
  },
];
export type AdminKpiCard = {
  id: "total" | "review" | "missing" | "ai-alerts" | "accepted" | "rejected";
  label: string;
  value: string;
  variant?: "default" | "warning" | "success" | "danger";
};

export const adminKpiCards: AdminKpiCard[] = [
  {
    id: "total",
    label: "Total Applications",
    value: "1,248",
  },
  {
    id: "review",
    label: "Under Review",
    value: "342",
    variant: "warning",
  },
  {
    id: "missing",
    label: "Missing Documents",
    value: "89",
  },
  {
    id: "ai-alerts",
    label: "AI Alerts",
    value: "24",
    variant: "danger",
  },
  {
    id: "accepted",
    label: "Accepted",
    value: "640",
    variant: "success",
  },
  {
    id: "rejected",
    label: "Rejected",
    value: "153",
  },
];
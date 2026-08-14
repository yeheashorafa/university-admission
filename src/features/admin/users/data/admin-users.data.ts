export type AdminUserRole =
  | "admin"
  | "admission_employee"
  | "department_head"
  | "admission_dean"
  | "student";

export type AdminUserStatus = "active" | "inactive" | "pending";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  lastLogin: string;
  createdAt: string;
};

export const adminUsersMock: AdminUser[] = [
  {
    id: "1",
    name: "Ahmed Mahmoud",
    email: "ahmed.mahmoud@iugaza.edu",
    role: "admission_employee",
    status: "active",
    lastLogin: "Today, 09:40 AM",
    createdAt: "Jan 12, 2026",
  },
  {
    id: "2",
    name: "Mona Saleh",
    email: "mona.saleh@iugaza.edu",
    role: "department_head",
    status: "active",
    lastLogin: "Yesterday, 03:15 PM",
    createdAt: "Feb 03, 2026",
  },
  {
    id: "3",
    name: "Khaled Ibrahim",
    email: "khaled.ibrahim@email.com",
    role: "student",
    status: "pending",
    lastLogin: "Never",
    createdAt: "Oct 12, 2026",
  },
  {
    id: "4",
    name: "Sara Naser",
    email: "sara.naser@iugaza.edu",
    role: "admin",
    status: "inactive",
    lastLogin: "Sep 28, 2026",
    createdAt: "Mar 18, 2026",
  },
];

export const userStatsMock = [
  {
    key: "totalUsers",
    value: "2,418",
  },
  {
    key: "activeStaff",
    value: "36",
  },
  {
    key: "studentAccounts",
    value: "2,364",
  },
  {
    key: "pendingAccounts",
    value: "18",
  },
] as const;
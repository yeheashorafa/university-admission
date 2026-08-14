import type { UserRole } from "@/constants/roles";
import { userRoles } from "@/constants/roles";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  profileCompleted?: boolean;
};

const demoUsers: Array<DemoUser & { password: string }> = [
  {
    id: "demo-dean-1",
    name: "Admission Dean",
    email: "dean@iug.edu.ps",
    password: "Dean@123",
    role: userRoles.admissionDean,
    token: "mock-dean-token",
    profileCompleted: true,
  },
  {
    id: "demo-head-1",
    name: "Department Head",
    email: "head@iug.edu.ps",
    password: "Head@123",
    role: userRoles.departmentHead,
    token: "mock-head-token",
    profileCompleted: true,
  },
  {
    id: "demo-employee-1",
    name: "Admission Employee",
    email: "employee@iug.edu.ps",
    password: "Employee@123",
    role: userRoles.admissionEmployee,
    token: "mock-employee-token",
    profileCompleted: false,
  },
  {
    id: "demo-student-1",
    name: "Student User",
    email: "student@iug.edu.ps",
    password: "Student@123",
    role: userRoles.student,
    token: "mock-student-token",
    profileCompleted: true,
  },
];

export function getDemoUserByCredentials(email: string, password: string) {
  return demoUsers.find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password
  );
}

export function saveDemoAuth(user: DemoUser) {
  localStorage.setItem(
    "auth-storage",
    JSON.stringify({
      state: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileCompleted: user.profileCompleted ?? true,
        },
        token: user.token,
      },
      version: 0,
    })
  );

  localStorage.setItem("access_token", user.token);
  window.dispatchEvent(new Event("auth-storage-change"));
}
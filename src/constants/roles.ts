export const userRoles = {
  student: "student",
  admissionDean: "admission_dean",
  departmentHead: "department_head",
  admissionEmployee: "admission_employee",
  admin: "admin",
} as const;

export type UserRole = (typeof userRoles)[keyof typeof userRoles];

export const adminRoles: UserRole[] = [
  userRoles.admissionDean,
  userRoles.departmentHead,
  userRoles.admissionEmployee,
  userRoles.admin,
];

export function isStudentRole(role?: string | null) {
  return role === userRoles.student;
}

export function isAdminRole(role?: string | null) {
  return adminRoles.includes(role as UserRole);
}

export function isSuperAdmin(role?: string | null) {
  return role === userRoles.admin;
}

export function isAdmissionDean(role?: string | null) {
  return role === userRoles.admissionDean;
}

export function isDepartmentHead(role?: string | null) {
  return role === userRoles.departmentHead;
}

export function isAdmissionEmployee(role?: string | null) {
  return role === userRoles.admissionEmployee;
}

export function canManageEmployees(role?: string | null) {
  return isDepartmentHead(role) || isSuperAdmin(role);
}

export function canReviewAiFailedApplications(role?: string | null) {
  return isAdmissionEmployee(role) || isDepartmentHead(role) || isSuperAdmin(role);
}

export function canReviewEmployeeDecision(role?: string | null) {
  return isDepartmentHead(role) || isSuperAdmin(role);
}

export function canViewAllStatistics(role?: string | null) {
  return isAdmissionDean(role) || isDepartmentHead(role) || isSuperAdmin(role);
}

export function canAccessAdmin(role?: string | null) {
  return isAdminRole(role);
}
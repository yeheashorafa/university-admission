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
  departmentId?: string | number;
  facultyId?: string | number;
};
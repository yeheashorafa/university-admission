import { apiClient, extractApplicationsArray, extractResource } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { BackendApplicationStatus } from "@/lib/adapters/status-adapter";
import { normalizeStatus } from "@/lib/adapters/status-adapter";
import { extractStudentName } from "@/lib/utils/application-formatters";

export type HeadApplication = {
  id: string | number;
  applicationNo: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  nationalId?: string;
  program: string;
  department: string;
  faculty: string;
  status: BackendApplicationStatus;
  forwardedAt?: string;
  submittedAt?: string;
  createdAt?: string;
  reviewerName?: string;
  reviewerId?: string | number;
  employeeNotes?: string;
  decisionReason?: string;
  raw?: Record<string, unknown>;
};

const FORWARDED_HEAD_STATUS_SET = new Set([
  "forwarded_to_department_head",
  "head_review",
  "pending_head_review",
  "in_department_review",
  "dept_head_review",
]);

export function isForwardedToHead(status?: string | null): boolean {
  if (!status) return false;
  return FORWARDED_HEAD_STATUS_SET.has(status);
}

export function normalizeHeadApplication(
  raw: Record<string, unknown>,
  locale: string = "ar"
): HeadApplication {
  const isAr = locale.startsWith("ar");

  // 1. Application Number resolution
  const applicationNo =
    (typeof raw.application_number === "string" && raw.application_number.trim()) ||
    (typeof raw.application_no === "string" && raw.application_no.trim()) ||
    (typeof raw.applicationNo === "string" && raw.applicationNo.trim()) ||
    (typeof raw.code === "string" && raw.code.trim()) ||
    (typeof raw.number === "string" && raw.number.trim()) ||
    (raw.id ? `APP-${raw.id}` : "—");

  // 2. Canonical Student Name
  const studentName = extractStudentName(raw);

  // 3. Contact & Identification
  const applicantObj =
    raw.applicant && typeof raw.applicant === "object"
      ? (raw.applicant as Record<string, unknown>)
      : raw.student && typeof raw.student === "object"
        ? (raw.student as Record<string, unknown>)
        : raw.user && typeof raw.user === "object"
          ? (raw.user as Record<string, unknown>)
          : null;

  const studentEmail =
    (typeof raw.studentEmail === "string" && raw.studentEmail.trim()) ||
    (applicantObj && typeof applicantObj.email === "string" && applicantObj.email.trim()) ||
    (typeof raw.email === "string" && raw.email.trim()) ||
    "—";

  const studentPhone =
    (typeof raw.studentPhone === "string" && raw.studentPhone.trim()) ||
    (applicantObj && typeof applicantObj.phone === "string" && applicantObj.phone.trim()) ||
    (typeof raw.phone === "string" && raw.phone.trim()) ||
    "—";

  const nationalId =
    (typeof raw.nationalId === "string" && raw.nationalId.trim()) ||
    (typeof raw.national_id === "string" && raw.national_id.trim()) ||
    (applicantObj && typeof applicantObj.national_id === "string" && applicantObj.national_id.trim()) ||
    "—";

  // 4. Program name as string (NEVER raw object)
  const progObj =
    raw.selected_program && typeof raw.selected_program === "object"
      ? (raw.selected_program as Record<string, unknown>)
      : raw.program && typeof raw.program === "object"
        ? (raw.program as Record<string, unknown>)
        : raw.selectedProgram && typeof raw.selectedProgram === "object"
          ? (raw.selectedProgram as Record<string, unknown>)
          : Array.isArray(raw.preferences) && raw.preferences[0]?.program && typeof raw.preferences[0].program === "object"
            ? (raw.preferences[0].program as Record<string, unknown>)
            : null;

  let program = "—";
  if (typeof raw.program === "string" && raw.program.trim()) {
    program = raw.program.trim();
  } else if (typeof raw.selected_program === "string" && raw.selected_program.trim()) {
    program = raw.selected_program.trim();
  } else if (typeof raw.selectedProgram === "string" && raw.selectedProgram.trim()) {
    program = raw.selectedProgram.trim();
  } else if (progObj) {
    const nameAr = typeof progObj.name_ar === "string" ? progObj.name_ar.trim() : "";
    const nameEn = typeof progObj.name_en === "string" ? progObj.name_en.trim() : "";
    const name = typeof progObj.name === "string" ? progObj.name.trim() : "";
    program = isAr ? nameAr || nameEn || name || "—" : nameEn || nameAr || name || "—";
  }

  // 5. Department resolution
  const deptObj =
    progObj?.department && typeof progObj.department === "object"
      ? (progObj.department as Record<string, unknown>)
      : raw.department && typeof raw.department === "object"
        ? (raw.department as Record<string, unknown>)
        : null;

  let department = "—";
  if (typeof raw.department === "string" && raw.department.trim()) {
    department = raw.department.trim();
  } else if (deptObj) {
    const nameAr = typeof deptObj.name_ar === "string" ? deptObj.name_ar.trim() : "";
    const nameEn = typeof deptObj.name_en === "string" ? deptObj.name_en.trim() : "";
    const name = typeof deptObj.name === "string" ? deptObj.name.trim() : "";
    department = isAr ? nameAr || nameEn || name || "—" : nameEn || nameAr || name || "—";
  }

  // 6. Faculty resolution (NEVER use department as faculty name; return '—' if unavailable)
  const facObj =
    deptObj?.faculty && typeof deptObj.faculty === "object"
      ? (deptObj.faculty as Record<string, unknown>)
      : progObj?.faculty && typeof progObj.faculty === "object"
        ? (progObj.faculty as Record<string, unknown>)
        : raw.faculty && typeof raw.faculty === "object"
          ? (raw.faculty as Record<string, unknown>)
          : null;

  let faculty = "—";
  if (typeof raw.faculty === "string" && raw.faculty.trim()) {
    faculty = raw.faculty.trim();
  } else if (typeof raw.faculty_name === "string" && raw.faculty_name.trim()) {
    faculty = raw.faculty_name.trim();
  } else if (facObj) {
    const nameAr = typeof facObj.name_ar === "string" ? facObj.name_ar.trim() : "";
    const nameEn = typeof facObj.name_en === "string" ? facObj.name_en.trim() : "";
    const name = typeof facObj.name === "string" ? facObj.name.trim() : "";
    faculty = isAr ? nameAr || nameEn || name || "—" : nameEn || nameAr || name || "—";
  }

  // 7. Status & Workflow
  const status = normalizeStatus(raw.status as string);

  // 8. Timestamps
  const forwardedAt =
    (typeof raw.forwarded_at === "string" && raw.forwarded_at) ||
    (typeof raw.forwardedAt === "string" && raw.forwardedAt) ||
    (typeof raw.updated_at === "string" && raw.updated_at) ||
    (typeof raw.updatedAt === "string" && raw.updatedAt) ||
    undefined;

  const submittedAt =
    (typeof raw.submitted_at === "string" && raw.submitted_at) ||
    (typeof raw.submittedAt === "string" && raw.submittedAt) ||
    undefined;

  const createdAt =
    (typeof raw.created_at === "string" && raw.created_at) ||
    (typeof raw.createdAt === "string" && raw.createdAt) ||
    undefined;

  // 9. Reviewer info
  const reviewerObj =
    raw.assigned_reviewer && typeof raw.assigned_reviewer === "object"
      ? (raw.assigned_reviewer as Record<string, unknown>)
      : raw.reviewer && typeof raw.reviewer === "object"
        ? (raw.reviewer as Record<string, unknown>)
        : null;

  const reviewerName =
    (reviewerObj && typeof reviewerObj.name === "string" && reviewerObj.name.trim()) ||
    (typeof raw.assigned_employee_name === "string" && raw.assigned_employee_name.trim()) ||
    undefined;

  const reviewerId =
    (reviewerObj && (reviewerObj.id as string | number)) ||
    (raw.assigned_reviewer_id as string | number) ||
    (raw.assignedReviewerId as string | number) ||
    undefined;

  const employeeNotes =
    (typeof raw.employee_notes === "string" && raw.employee_notes) ||
    (typeof raw.employeeNotes === "string" && raw.employeeNotes) ||
    (typeof raw.notes === "string" && raw.notes) ||
    undefined;

  const decisionReason =
    (typeof raw.decision_reason === "string" && raw.decision_reason) ||
    (typeof raw.decisionReason === "string" && raw.decisionReason) ||
    undefined;

  return {
    id: (raw.id as string | number) ?? "—",
    applicationNo,
    studentName,
    studentEmail,
    studentPhone,
    nationalId,
    program,
    department,
    faculty,
    status,
    forwardedAt,
    submittedAt,
    createdAt,
    reviewerName,
    reviewerId,
    employeeNotes,
    decisionReason,
    raw,
  };
}

export async function getHeadApplications(params?: {
  page?: number;
  status?: string;
  search?: string;
}): Promise<HeadApplication[]> {
  const response = await apiClient.get<HeadApplication[] | { data: HeadApplication[] }>(
    ENDPOINTS.departmentHead.applications,
    { params }
  );
  const rawList = extractApplicationsArray<Record<string, unknown>>(response.data);
  return rawList.map((item) => normalizeHeadApplication(item));
}

export async function getHeadApplicationById(
  id: string | number
): Promise<HeadApplication> {
  const response = await apiClient.get<Record<string, unknown> | { data: Record<string, unknown> }>(
    ENDPOINTS.departmentHead.applicationDetail(id)
  );
  const raw = extractResource<Record<string, unknown>>(response.data);
  return normalizeHeadApplication(raw);
}

export async function acceptApplicationByHead(
  id: string | number
): Promise<HeadApplication> {
  const response = await apiClient.post<Record<string, unknown> | { data: Record<string, unknown> }>(
    ENDPOINTS.departmentHead.accept(id)
  );
  const raw = extractResource<Record<string, unknown>>(response.data);
  return normalizeHeadApplication(raw);
}

export async function rejectApplicationByHead(
  id: string | number
): Promise<HeadApplication> {
  const response = await apiClient.post<Record<string, unknown> | { data: Record<string, unknown> }>(
    ENDPOINTS.departmentHead.reject(id)
  );
  const raw = extractResource<Record<string, unknown>>(response.data);
  return normalizeHeadApplication(raw);
}

export async function returnApplicationToEmployee(
  id: string | number
): Promise<HeadApplication> {
  const response = await apiClient.post<Record<string, unknown> | { data: Record<string, unknown> }>(
    ENDPOINTS.departmentHead.returnToEmployee(id)
  );
  const raw = extractResource<Record<string, unknown>>(response.data);
  return normalizeHeadApplication(raw);
}

import {
  applicationStatuses,
  type ApplicationStatus,
  type ApplicationWorkflowLog,
} from "@/constants/application-workflow";
import { extractStudentName } from "@/lib/utils/application-formatters";
import { normalizeStatus } from "@/lib/adapters/status-adapter";
import { isForwardedToHead } from "@/services/department-head.service";

export type WorkflowApplication = {
  id: string;
  applicationNo: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  nationalId: string;
  selectedProgram: string;
  admissionCycle?: string;
  department?: string;
  faculty: string;
  average: string;
  currentStatus: ApplicationStatus;
  aiConfidence: number;
  aiStatus?: string;
  recommendation?: string;
  aiFailureReason?: string;
  aiNotes?: string;
  riskFlags?: string[];
  extractedDataSummary?: Record<string, string>;
  assignedEmployeeName?: string;
  assignedReviewerId?: string | number;
  employeeDecisionBy?: string;
  departmentHeadDecisionBy?: string;
  rejectionNote?: string;
  forwardReason?: string;
  isForwardNoteMissing?: boolean;
  employeeNotes?: string;
  decisionReason?: string;
  missingDocumentsNote?: string;
  paymentReference?: string;
  universityNumber?: string;
  socialResearchStatus?: "not_required" | "required" | "submitted";
  createdAt: string;
  updatedAt?: string;
  workflowLogs: ApplicationWorkflowLog[];
};

export const workflowApplicationsMock: WorkflowApplication[] = [
  {
    id: "app-1",
    applicationNo: "APP-2026-8001",
    studentName: "Ahmed Mohammad Hassan",
    nationalId: "405938271",
    selectedProgram: "Software Engineering",
    faculty: "Faculty of Information Technology",
    average: "91.5%",
    currentStatus: applicationStatuses.aiFailed,
    aiConfidence: 61,
    aiStatus: "needs_review",
    recommendation: "Manual verification required for high school transcript scan.",
    aiFailureReason: "جودة صورة كشف الدرجات غير واضحة للتأكد الآلي من اسم المدرسة والمعدل.",
    aiNotes: "تم مطابقة رقم الهوية والاسم بنجاح، لكن كشف الدرجات يحتاج مراجعة دقيقة من موظف القبول.",
    riskFlags: ["Low Scan Quality", "Manual Approval Needed"],
    extractedDataSummary: {
      "High School Score": "91.5%",
      "Identity Match": "100%",
      "Certificate Status": "Pledged / Unclear Scan",
    },
    assignedEmployeeName: "Admission Employee",
    createdAt: "2026-08-15",
    updatedAt: "2026-08-16",
    socialResearchStatus: "not_required",
    workflowLogs: [
      {
        id: "log-1",
        status: applicationStatuses.submitted,
        actor: "student",
        decision: "submitted",
        actorName: "Ahmed Mohammad Hassan",
        note: "Application submitted with required documents.",
        createdAt: "2026-08-15 09:20",
      },
      {
        id: "log-2",
        status: applicationStatuses.aiReview,
        actor: "ai",
        decision: "needs_review",
        actorName: "AI Verification Engine",
        note: "AI confidence is below the required threshold. Manual review is needed.",
        createdAt: "2026-08-15 09:24",
      },
      {
        id: "log-3",
        status: applicationStatuses.aiFailed,
        actor: "ai",
        decision: "needs_review",
        actorName: "AI Verification Engine",
        note: "The transcript scan quality is not enough for automatic approval.",
        createdAt: "2026-08-15 09:25",
      },
    ],
  },
  {
    id: "app-2",
    applicationNo: "APP-2026-1002",
    studentName: "Sara Khaled Ahmad",
    nationalId: "409876123",
    selectedProgram: "Medicine",
    faculty: "Faculty of Medicine",
    average: "96.2%",
    currentStatus: applicationStatuses.headReview,
    aiConfidence: 88,
    assignedEmployeeName: "Admission Employee",
    employeeDecisionBy: "Admission Employee",
    createdAt: "2026-08-16",
    socialResearchStatus: "not_required",
    workflowLogs: [
      {
        id: "log-1",
        status: applicationStatuses.submitted,
        actor: "student",
        decision: "submitted",
        actorName: "Sara Khaled Ahmad",
        note: "Application submitted successfully.",
        createdAt: "2026-08-16 10:10",
      },
      {
        id: "log-2",
        status: applicationStatuses.aiFailed,
        actor: "ai",
        decision: "needs_review",
        actorName: "AI Verification Engine",
        note: "AI requested manual confirmation for transcript average.",
        createdAt: "2026-08-16 10:15",
      },
      {
        id: "log-3",
        status: applicationStatuses.employeeApproved,
        actor: "admission_employee",
        decision: "approved",
        actorName: "Admission Employee",
        note: "Documents reviewed manually and accepted.",
        createdAt: "2026-08-16 11:30",
      },
      {
        id: "log-4",
        status: applicationStatuses.headReview,
        actor: "system",
        decision: "needs_review",
        actorName: "System",
        note: "Application moved to department head review.",
        createdAt: "2026-08-16 11:31",
      },
    ],
  },
  {
    id: "app-3",
    applicationNo: "APP-2026-1003",
    studentName: "Khaled Mahmoud Saleh",
    nationalId: "407771234",
    selectedProgram: "Computer Science",
    faculty: "Faculty of Information Technology",
    average: "84.0%",
    currentStatus: applicationStatuses.paymentPending,
    aiConfidence: 93,
    assignedEmployeeName: "Admission Employee",
    employeeDecisionBy: "Admission Employee",
    departmentHeadDecisionBy: "Department Head",
    createdAt: "2026-08-17",
    socialResearchStatus: "not_required",
    workflowLogs: [
      {
        id: "log-1",
        status: applicationStatuses.submitted,
        actor: "student",
        decision: "submitted",
        actorName: "Khaled Mahmoud Saleh",
        note: "Application submitted.",
        createdAt: "2026-08-17 08:40",
      },
      {
        id: "log-2",
        status: applicationStatuses.aiApproved,
        actor: "ai",
        decision: "approved",
        actorName: "AI Verification Engine",
        note: "AI verified the uploaded documents with high confidence.",
        createdAt: "2026-08-17 08:44",
      },
      {
        id: "log-3",
        status: applicationStatuses.headApproved,
        actor: "department_head",
        decision: "approved",
        actorName: "Department Head",
        note: "Department head approved the application.",
        createdAt: "2026-08-17 09:20",
      },
      {
        id: "log-4",
        status: applicationStatuses.paymentPending,
        actor: "system",
        decision: "needs_review",
        actorName: "System",
        note: "Application moved to payment step.",
        createdAt: "2026-08-17 09:21",
      },
    ],
  },
  {
    id: "app-4",
    applicationNo: "APP-2026-1004",
    studentName: "Mariam Nasser Ali",
    nationalId: "408881222",
    selectedProgram: "Nursing",
    faculty: "Faculty of Health Sciences",
    average: "82.5%",
    currentStatus: applicationStatuses.socialResearchRequired,
    aiConfidence: 95,
    assignedEmployeeName: "Admission Employee",
    employeeDecisionBy: "Admission Employee",
    departmentHeadDecisionBy: "Department Head",
    paymentReference: "PAY-90901",
    universityNumber: "202610045",
    createdAt: "2026-08-18",
    socialResearchStatus: "required",
    workflowLogs: [
      {
        id: "log-1",
        status: applicationStatuses.submitted,
        actor: "student",
        decision: "submitted",
        actorName: "Mariam Nasser Ali",
        note: "Application submitted.",
        createdAt: "2026-08-18 09:00",
      },
      {
        id: "log-2",
        status: applicationStatuses.paymentCompleted,
        actor: "payment_system",
        decision: "payment_completed",
        actorName: "Payment System",
        note: "Payment completed successfully.",
        createdAt: "2026-08-18 10:15",
      },
      {
        id: "log-3",
        status: applicationStatuses.universityNumberIssued,
        actor: "system",
        decision: "issued",
        actorName: "System",
        note: "University number issued: 202610045.",
        createdAt: "2026-08-18 10:16",
      },
      {
        id: "log-4",
        status: applicationStatuses.socialResearchRequired,
        actor: "system",
        decision: "needs_review",
        actorName: "System",
        note: "Student must complete the social research form.",
        createdAt: "2026-08-18 10:17",
      },
    ],
  },
  {
    id: "app-5",
    applicationNo: "APP-2026-1005",
    studentName: "Ahmed Mohammad Hassan",
    nationalId: "405938271",
    selectedProgram: "Civil Engineering",
    faculty: "Faculty of Engineering",
    average: "88.0%",
    currentStatus: applicationStatuses.draft,
    aiConfidence: 0,
    createdAt: "2026-08-19",
    socialResearchStatus: "not_required",
    workflowLogs: [
      {
        id: "log-1",
        status: applicationStatuses.draft,
        actor: "student",
        decision: "submitted",
        actorName: "Ahmed Mohammad Hassan",
        note: "Draft application created.",
        createdAt: "2026-08-19 14:00",
      },
    ],
  },
  {
    id: "app-6",
    applicationNo: "APP-2026-1006",
    studentName: "Ahmed Mohammad Hassan",
    nationalId: "405938271",
    selectedProgram: "English Literature",
    faculty: "Faculty of Arts",
    average: "85.4%",
    currentStatus: applicationStatuses.completed,
    aiConfidence: 96,
    paymentReference: "PAY-2026-8812",
    universityNumber: "202610012",
    createdAt: "2026-08-10",
    socialResearchStatus: "submitted",
    workflowLogs: [
      {
        id: "log-1",
        status: applicationStatuses.submitted,
        actor: "student",
        decision: "submitted",
        actorName: "Ahmed Mohammad Hassan",
        note: "Application submitted.",
        createdAt: "2026-08-10 11:00",
      },
      {
        id: "log-2",
        status: applicationStatuses.paymentCompleted,
        actor: "payment_system",
        decision: "payment_completed",
        actorName: "Payment System",
        note: "Payment completed successfully.",
        createdAt: "2026-08-10 12:30",
      },
      {
        id: "log-3",
        status: applicationStatuses.socialResearchSubmitted,
        actor: "student",
        decision: "submitted",
        actorName: "Ahmed Mohammad Hassan",
        note: "Social research submitted.",
        createdAt: "2026-08-11 09:15",
      },
      {
        id: "log-4",
        status: applicationStatuses.completed,
        actor: "system",
        decision: "approved",
        actorName: "System",
        note: "Admission file completed and active.",
        createdAt: "2026-08-11 09:16",
      },
    ],
  },
];

export function mapBackendApplicationToWorkflowApplication(
  app: Record<string, unknown> | null | undefined
): WorkflowApplication {
  if (!app) {
    return {
      id: "",
      applicationNo: "—",
      studentName: "—",
      studentEmail: "—",
      studentPhone: "—",
      nationalId: "—",
      selectedProgram: "—",
      admissionCycle: "—",
      department: "—",
      faculty: "—",
      average: "—",
      currentStatus: "submitted" as ApplicationStatus,
      aiConfidence: 0,
      createdAt: new Date().toISOString().split("T")[0],
      workflowLogs: [],
    };
  }

  const id = String(app.id ?? "");
  const applicationNo =
    (typeof app.applicationNo === "string" && app.applicationNo) ||
    (typeof app.application_number === "string" && app.application_number) ||
    (typeof app.application_no === "string" && app.application_no) ||
    (id ? `APP-${id}` : "—");

  const applicantObj = app.applicant ?? app.student ?? app.user ?? null;

  const studentName = extractStudentName(app, "—");

  let studentEmail = "—";
  let studentPhone = "—";

  if (typeof app.studentEmail === "string" && app.studentEmail.trim()) studentEmail = app.studentEmail.trim();
  else if (typeof app.email === "string" && app.email.trim()) studentEmail = app.email.trim();

  if (typeof app.studentPhone === "string" && app.studentPhone.trim()) studentPhone = app.studentPhone.trim();
  else if (typeof app.phone === "string" && app.phone.trim()) studentPhone = app.phone.trim();

  if (applicantObj && typeof applicantObj === "object") {
    const s = applicantObj as Record<string, unknown>;
    if (studentEmail === "—" && typeof s.email === "string" && s.email.trim()) studentEmail = s.email.trim();
    if (studentPhone === "—" && typeof s.phone === "string" && s.phone.trim()) studentPhone = s.phone.trim();
  }

  const objectsToSearch = [
    app.applicant,
    app.student,
    app.user,
    app.profile,
  ].filter(Boolean) as Record<string, unknown>[];

  let nationalId = "—";
  if (typeof app.nationalId === "string" && app.nationalId.trim()) nationalId = app.nationalId.trim();
  else if (typeof app.national_id === "string" && app.national_id.trim()) nationalId = app.national_id.trim();
  else {
    let foundNi = false;
    for (const obj of objectsToSearch) {
      if (typeof obj.national_id === "string" && obj.national_id.trim()) { nationalId = obj.national_id.trim(); foundNi = true; break; }
      const pi = obj.personal_information as Record<string, unknown> | undefined;
      if (pi && typeof pi.national_id === "string" && pi.national_id.trim()) { nationalId = pi.national_id.trim(); foundNi = true; break; }
      const prof = obj.profile as Record<string, unknown> | undefined;
      if (prof && typeof prof.national_id === "string" && prof.national_id.trim()) { nationalId = prof.national_id.trim(); foundNi = true; break; }
      if (prof) {
        const profPi = prof.personal_information as Record<string, unknown> | undefined;
        if (profPi && typeof profPi.national_id === "string" && profPi.national_id.trim()) { nationalId = profPi.national_id.trim(); foundNi = true; break; }
      }
    }
    if (!foundNi) {
      const piTop = app.personal_information as Record<string, unknown> | undefined;
      if (piTop && typeof piTop.national_id === "string" && piTop.national_id.trim()) nationalId = piTop.national_id.trim();
    }
  }

  const progObj =
    (app.program && typeof app.program === "object" ? (app.program as Record<string, unknown>) : null) ||
    (app.selected_program && typeof app.selected_program === "object" ? (app.selected_program as Record<string, unknown>) : null) ||
    (app.selectedProgram && typeof app.selectedProgram === "object" ? (app.selectedProgram as Record<string, unknown>) : null) ||
    (Array.isArray(app.preferences) && app.preferences[0]?.program && typeof app.preferences[0].program === "object"
      ? (app.preferences[0].program as Record<string, unknown>)
      : null);

  let selectedProgram = "—";
  if (typeof app.program === "string" && app.program.trim()) selectedProgram = app.program.trim();
  else if (typeof app.selectedProgram === "string" && app.selectedProgram.trim()) selectedProgram = app.selectedProgram.trim();
  else if (typeof app.selected_program === "string" && app.selected_program.trim()) selectedProgram = app.selected_program.trim();
  else if (typeof app.program_name === "string" && app.program_name.trim()) selectedProgram = app.program_name.trim();
  else if (progObj) {
    if (typeof progObj.name_ar === "string" && progObj.name_ar.trim()) selectedProgram = progObj.name_ar.trim();
    else if (typeof progObj.name_en === "string" && progObj.name_en.trim()) selectedProgram = progObj.name_en.trim();
    else if (typeof progObj.name === "string" && progObj.name.trim()) selectedProgram = progObj.name.trim();
  }

  const deptObj =
    progObj?.department && typeof progObj.department === "object"
      ? (progObj.department as Record<string, unknown>)
      : app.department && typeof app.department === "object"
        ? (app.department as Record<string, unknown>)
        : null;

  let department = "—";
  if (typeof app.department === "string" && app.department.trim()) {
    department = app.department.trim();
  } else if (deptObj) {
    if (typeof deptObj.name_ar === "string" && deptObj.name_ar.trim()) department = deptObj.name_ar.trim();
    else if (typeof deptObj.name_en === "string" && deptObj.name_en.trim()) department = deptObj.name_en.trim();
    else if (typeof deptObj.name === "string" && deptObj.name.trim()) department = deptObj.name.trim();
  }

  let admissionCycle = "—";
  if (typeof app.admission_cycle === "string" && app.admission_cycle.trim()) admissionCycle = app.admission_cycle.trim();
  else if (app.admission_cycle && typeof app.admission_cycle === "object") {
    const ac = app.admission_cycle as Record<string, unknown>;
    if (typeof ac.name === "string" && ac.name.trim()) admissionCycle = ac.name.trim();
    else if (typeof ac.academic_year === "string" && ac.academic_year.trim()) admissionCycle = ac.academic_year.trim();
  }

  let faculty = "—";
  if (typeof app.faculty === "string" && app.faculty.trim()) {
    faculty = app.faculty.trim();
  } else if (typeof app.faculty_name === "string" && app.faculty_name.trim()) {
    faculty = app.faculty_name.trim();
  } else if (app.faculty && typeof app.faculty === "object") {
    const f = app.faculty as Record<string, unknown>;
    if (typeof f.name_ar === "string" && f.name_ar.trim()) faculty = f.name_ar.trim();
    else if (typeof f.name === "string" && f.name.trim()) faculty = f.name.trim();
    else if (typeof f.name_en === "string" && f.name_en.trim()) faculty = f.name_en.trim();
  } else if (deptObj?.faculty && typeof deptObj.faculty === "object") {
    const f = deptObj.faculty as Record<string, unknown>;
    if (typeof f.name_ar === "string" && f.name_ar.trim()) faculty = f.name_ar.trim();
    else if (typeof f.name_en === "string" && f.name_en.trim()) faculty = f.name_en.trim();
    else if (typeof f.name === "string" && f.name.trim()) faculty = f.name.trim();
  } else if (progObj?.faculty && typeof progObj.faculty === "object") {
    const f = progObj.faculty as Record<string, unknown>;
    if (typeof f.name_ar === "string" && f.name_ar.trim()) faculty = f.name_ar.trim();
    else if (typeof f.name_en === "string" && f.name_en.trim()) faculty = f.name_en.trim();
    else if (typeof f.name === "string" && f.name.trim()) faculty = f.name.trim();
  }

  const academicObj = (app.academic_information ?? app.academic_info ?? app.academicInfo) as Record<string, unknown> | undefined;
  const average =
    (typeof app.average === "string" && app.average) ||
    (typeof app.average === "number" ? `${app.average}%` : undefined) ||
    (typeof app.highSchoolPercentage === "string" && app.highSchoolPercentage) ||
    (typeof app.highSchoolPercentage === "number" ? `${app.highSchoolPercentage}%` : undefined) ||
    (typeof app.tawjihi_percentage === "number" ? `${app.tawjihi_percentage}%` : undefined) ||
    (typeof app.tawjihi_percentage === "string" && app.tawjihi_percentage) ||
    (typeof app.gpa === "number" ? `${app.gpa}%` : undefined) ||
    (typeof app.gpa === "string" && app.gpa) ||
    (academicObj && (
      (typeof academicObj.average === "number" ? `${academicObj.average}%` : (typeof academicObj.average === "string" ? academicObj.average : undefined)) ||
      (typeof academicObj.high_school_percentage === "number" ? `${academicObj.high_school_percentage}%` : (typeof academicObj.high_school_percentage === "string" ? academicObj.high_school_percentage : undefined)) ||
      (typeof academicObj.tawjihi_percentage === "number" ? `${academicObj.tawjihi_percentage}%` : (typeof academicObj.tawjihi_percentage === "string" ? academicObj.tawjihi_percentage : undefined)) ||
      (typeof academicObj.gpa === "number" ? `${academicObj.gpa}%` : (typeof academicObj.gpa === "string" ? academicObj.gpa : undefined))
    )) ||
    "—";

  const rawStatus =
    (typeof app.status === "string" && app.status) ||
    (typeof app.currentStatus === "string" && app.currentStatus) ||
    undefined;

  const currentStatus = (rawStatus ? normalizeStatus(rawStatus) : "submitted") as ApplicationStatus;

  const isForwarded = isForwardedToHead(currentStatus) || isForwardedToHead(rawStatus);
  const isRejected =
    currentStatus === "rejected" ||
    rawStatus === "rejected" ||
    rawStatus === "employee_rejected" ||
    rawStatus === "head_rejected" ||
    rawStatus === "ai_rejected";

  const rawDecisionReason =
    (typeof app.decisionReason === "string" && app.decisionReason.trim()) ||
    (typeof app.decision_reason === "string" && app.decision_reason.trim()) ||
    undefined;

  const rawEmployeeNotes =
    (typeof app.employeeNotes === "string" && app.employeeNotes.trim()) ||
    (typeof app.employee_notes === "string" && app.employee_notes.trim()) ||
    (typeof app.notes === "string" && app.notes.trim()) ||
    undefined;

  const explicitForwardReason =
    (typeof app.forwardReason === "string" && app.forwardReason.trim()) ||
    (typeof app.forward_reason === "string" && app.forward_reason.trim()) ||
    (typeof app.forward_note === "string" && app.forward_note.trim()) ||
    (typeof app.forwardNote === "string" && app.forwardNote.trim()) ||
    undefined;

  const forwardReason = isForwarded
    ? explicitForwardReason || rawDecisionReason || rawEmployeeNotes
    : undefined;

  const isForwardNoteMissing = isForwarded && !forwardReason;

  const rejectionNote =
    (typeof app.rejectionNote === "string" && app.rejectionNote.trim()) ||
    (typeof app.rejection_note === "string" && app.rejection_note.trim()) ||
    (typeof app.rejection_reason === "string" && app.rejection_reason.trim()) ||
    (isRejected ? rawDecisionReason : undefined);

  const aiConfidence =
    typeof app.aiConfidence === "number"
      ? app.aiConfidence
      : typeof app.ai_confidence === "number"
        ? app.ai_confidence
        : 0;

  const createdAt =
    (typeof app.submittedAt === "string" && app.submittedAt) ||
    (typeof app.submitted_at === "string" && app.submitted_at) ||
    (typeof app.createdAt === "string" && app.createdAt) ||
    (typeof app.created_at === "string" && app.created_at) ||
    (typeof app.forwardedAt === "string" && app.forwardedAt) ||
    "اليوم";

  const workflowLogs = Array.isArray(app.workflowLogs)
    ? (app.workflowLogs as ApplicationWorkflowLog[])
    : Array.isArray(app.logs)
      ? (app.logs as ApplicationWorkflowLog[])
      : [];

  return {
    id,
    applicationNo,
    studentName,
    studentEmail,
    studentPhone,
    nationalId,
    selectedProgram,
    admissionCycle,
    department,
    faculty,
    average,
    currentStatus,
    rejectionNote,
    forwardReason,
    isForwardNoteMissing,
    employeeNotes: rawEmployeeNotes,
    decisionReason: rawDecisionReason,
    aiConfidence,
    aiStatus: typeof app.aiStatus === "string" ? app.aiStatus : typeof app.ai_status === "string" ? app.ai_status : undefined,
    recommendation: typeof app.recommendation === "string" ? app.recommendation : undefined,
    aiFailureReason: typeof app.aiFailureReason === "string" ? app.aiFailureReason : undefined,
    aiNotes: typeof app.aiNotes === "string" ? app.aiNotes : undefined,
    assignedEmployeeName:
      typeof app.assignedEmployeeName === "string"
        ? app.assignedEmployeeName
        : (app.assigned_reviewer as Record<string, unknown>)?.name as string | undefined ??
          (app.assigned_reviewer as Record<string, unknown>)?.name_ar as string | undefined,
    assignedReviewerId:
      (app.assigned_reviewer_id as string | number | undefined) ??
      (app.assignedReviewerId as string | number | undefined) ??
      (app.assigned_reviewer as Record<string, unknown>)?.id as string | number | undefined,
    createdAt,
    updatedAt: typeof app.updatedAt === "string" ? app.updatedAt : undefined,
    workflowLogs,
  };
}
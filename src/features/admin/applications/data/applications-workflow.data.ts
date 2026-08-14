import {
  applicationStatuses,
  type ApplicationStatus,
  type ApplicationWorkflowLog,
} from "@/constants/application-workflow";

export type WorkflowApplication = {
  id: string;
  applicationNo: string;
  studentName: string;
  nationalId: string;
  selectedProgram: string;
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
  employeeDecisionBy?: string;
  departmentHeadDecisionBy?: string;
  rejectionNote?: string;
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
      studentName: "غير متوفر",
      nationalId: "غير متوفر",
      selectedProgram: "غير متوفر",
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
    (typeof app.application_no === "string" && app.application_no) ||
    (id ? `APP-${id}` : "—");

  const studentName =
    (typeof app.studentName === "string" && app.studentName) ||
    (typeof app.student_name === "string" && app.student_name) ||
    "غير متوفر";

  const nationalId =
    (typeof app.nationalId === "string" && app.nationalId) ||
    (typeof app.national_id === "string" && app.national_id) ||
    "—";

  const selectedProgram =
    (typeof app.program === "string" && app.program) ||
    (typeof app.selectedProgram === "string" && app.selectedProgram) ||
    (typeof app.program_name === "string" && app.program_name) ||
    "غير متوفر";

  const faculty =
    (typeof app.faculty === "string" && app.faculty) ||
    (typeof app.faculty_name === "string" && app.faculty_name) ||
    (typeof app.department === "string" && app.department) ||
    "—";

  const average =
    (typeof app.average === "string" && app.average) ||
    (typeof app.highSchoolPercentage === "string" && app.highSchoolPercentage) ||
    (typeof app.highSchoolPercentage === "number" ? `${app.highSchoolPercentage}%` : undefined) ||
    (typeof app.tawjihi_percentage === "number" ? `${app.tawjihi_percentage}%` : undefined) ||
    (typeof app.gpa === "number" ? `${app.gpa}%` : undefined) ||
    "—";

  const currentStatus =
    ((typeof app.status === "string" && app.status) ||
    (typeof app.currentStatus === "string" && app.currentStatus) ||
    "submitted") as ApplicationStatus;

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
    nationalId,
    selectedProgram,
    faculty,
    average,
    currentStatus,
    aiConfidence,
    aiStatus: typeof app.aiStatus === "string" ? app.aiStatus : typeof app.ai_status === "string" ? app.ai_status : undefined,
    recommendation: typeof app.recommendation === "string" ? app.recommendation : undefined,
    aiFailureReason: typeof app.aiFailureReason === "string" ? app.aiFailureReason : undefined,
    aiNotes: typeof app.aiNotes === "string" ? app.aiNotes : undefined,
    assignedEmployeeName: typeof app.assignedEmployeeName === "string" ? app.assignedEmployeeName : undefined,
    createdAt,
    updatedAt: typeof app.updatedAt === "string" ? app.updatedAt : undefined,
    workflowLogs,
  };
}
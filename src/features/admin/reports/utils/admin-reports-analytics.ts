import {
  applicationStatuses,
  type ApplicationStatus,
} from "@/constants/application-workflow";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";
import type {
  ReportLabelCount,
} from "@/services/admin-reports.service";

export type ReportsChartItem = {
  key: string;
  label?: string;
  value: number;
};

function countByStatuses(
  applications: WorkflowApplication[],
  statuses: ApplicationStatus[]
) {
  return applications.filter((application) =>
    statuses.includes(application.currentStatus)
  ).length;
}

export function buildAdminReportsAnalytics(
  applications: WorkflowApplication[],
  reports?: { 
    byStatus?: ReportLabelCount[] | null; 
    byFaculty?: ReportLabelCount[] | null;
    byDepartment?: ReportLabelCount[] | null;
    byProgram?: ReportLabelCount[] | null;
  }
) {
  const rejectedStatuses: ApplicationStatus[] = [
    applicationStatuses.aiRejected,
    applicationStatuses.employeeRejected,
    applicationStatuses.headRejected,
  ];

  const acceptedStatuses: ApplicationStatus[] = [
    applicationStatuses.headApproved,
    applicationStatuses.paymentPending,
    applicationStatuses.paymentCompleted,
    applicationStatuses.universityNumberIssued,
    applicationStatuses.socialResearchRequired,
    applicationStatuses.socialResearchSubmitted,
    applicationStatuses.completed,
  ];

  const pendingReviewStatuses: ApplicationStatus[] = [
    applicationStatuses.aiFailed,
    applicationStatuses.employeeReview,
    applicationStatuses.employeeApproved,
    applicationStatuses.headReview,
  ];

  const totalApplications = reports?.byStatus
    ? reports.byStatus.reduce((acc, curr) => acc + curr.count, 0)
    : applications.length;

  const applicationsWithConfidence = applications.filter(
    (app) => typeof app.aiConfidence === "number" && app.aiConfidence > 0
  );

  const averageAiConfidence =
    applicationsWithConfidence.length === 0
      ? 0
      : Math.round(
          (applicationsWithConfidence.reduce(
            (total, app) => total + app.aiConfidence,
            0
          ) /
            applicationsWithConfidence.length) *
            10
        ) / 10;

  const facultyMap = applications.reduce<Record<string, number>>(
    (result, application) => {
      result[application.faculty] = (result[application.faculty] ?? 0) + 1;
      return result;
    },
    {}
  );

  let facultyDistribution: ReportsChartItem[] | null = null;
  if (reports?.byFaculty) {
    facultyDistribution = reports.byFaculty.map((item) => ({
      key: item.label,
      label: item.label,
      value: item.count,
    }));
  } else if (reports?.byFaculty === undefined) {
    facultyDistribution = Object.entries(facultyMap).map(([faculty, count]) => ({
      key: faculty,
      label: faculty,
      value: count,
    }));
  }

  let departmentDistribution: ReportsChartItem[] | null = null;
  if (reports?.byDepartment) {
    departmentDistribution = reports.byDepartment.map((item) => ({
      key: item.label,
      label: item.label,
      value: item.count,
    }));
  } else if (reports?.byDepartment === undefined) {
    departmentDistribution = []; // Fallback empty if not provided and not failed
  }

  let programDistribution: ReportsChartItem[] | null = null;
  if (reports?.byProgram) {
    programDistribution = reports.byProgram.map((item) => ({
      key: item.label,
      label: item.label,
      value: item.count,
    }));
  } else if (reports?.byProgram === undefined) {
    programDistribution = []; // Fallback empty
  }

  const aiConfidenceDistribution: ReportsChartItem[] = [
    {
      key: "low",
      value: applicationsWithConfidence.filter((app) => app.aiConfidence < 70).length,
    },
    {
      key: "medium",
      value: applicationsWithConfidence.filter(
        (app) => app.aiConfidence >= 70 && app.aiConfidence < 90
      ).length,
    },
    {
      key: "high",
      value: applicationsWithConfidence.filter((app) => app.aiConfidence >= 90).length,
    },
  ];

  let statusDistribution: ReportsChartItem[] | null = null;
  if (reports?.byStatus) {
    statusDistribution = reports.byStatus.map((item) => ({
      key: item.label,
      label: item.label,
      value: item.count,
    }));
  } else if (reports?.byStatus === undefined) {
    statusDistribution = [
        {
          key: "aiFailed",
          value: countByStatuses(applications, [applicationStatuses.aiFailed]),
        },
        {
          key: "headReview",
          value: countByStatuses(applications, [applicationStatuses.headReview]),
        },
        {
          key: "paymentPending",
          value: countByStatuses(applications, [
            applicationStatuses.paymentPending,
          ]),
        },
        {
          key: "socialResearchRequired",
          value: countByStatuses(applications, [
            applicationStatuses.socialResearchRequired,
          ]),
        },
        {
          key: "completed",
          value: countByStatuses(applications, [applicationStatuses.completed]),
        },
        {
          key: "rejected",
          value: countByStatuses(applications, rejectedStatuses),
        },
      ];
  }

  const acceptedCount = reports?.byStatus
    ? reports.byStatus
        .filter((item) =>
          [
            "accepted",
            "approved",
            "head_approved",
            "payment_pending",
            "payment_completed",
            "completed",
          ].includes(item.label.toLowerCase())
        )
        .reduce((sum, item) => sum + item.count, 0)
    : countByStatuses(applications, acceptedStatuses);

  const rejectedCount = reports?.byStatus
    ? reports.byStatus
        .filter((item) =>
          [
            "rejected",
            "cancelled",
            "ai_rejected",
            "employee_rejected",
            "head_rejected",
          ].includes(item.label.toLowerCase())
        )
        .reduce((sum, item) => sum + item.count, 0)
    : countByStatuses(applications, rejectedStatuses);

  const pendingReviewCount = reports?.byStatus
    ? reports.byStatus
        .filter((item) =>
          [
            "under_review",
            "submitted",
            "ai_failed",
            "employee_review",
            "head_review",
            "returned_to_employee",
            "returned_for_revision",
            "forwarded_to_department_head",
          ].includes(item.label.toLowerCase())
        )
        .reduce((sum, item) => sum + item.count, 0)
    : countByStatuses(applications, pendingReviewStatuses);

  const recentApplications = [...applications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return {
    totalApplications,
    acceptedApplications: acceptedCount,
    rejectedApplications: rejectedCount,
    pendingReviewApplications: pendingReviewCount,
    aiFailedApplications: countByStatuses(applications, [
      applicationStatuses.aiFailed,
    ]),
    completedApplications: countByStatuses(applications, [
      applicationStatuses.completed,
    ]),
    averageAiConfidence,
    statusDistribution,
    facultyDistribution,
    departmentDistribution,
    programDistribution,
    aiConfidenceDistribution,
    recentApplications,
  };
}
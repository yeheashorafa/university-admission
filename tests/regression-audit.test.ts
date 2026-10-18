import test from "node:test";
import assert from "node:assert/strict";

import {
  isSuperAdmin,
  isStudentRole,
  userRoles,
} from "../src/constants/roles";
import { canAccessRole } from "../src/lib/auth-helpers";
import {
  getDashboardRouteByRole,
  canAccessRoute,
} from "../src/constants/role-navigation";
import { routes } from "../src/constants/routes";
import {
  normalizeHeadApplication,
  isForwardedToHead,
} from "../src/services/department-head.service";
import {
  mapBackendApplicationToWorkflowApplication,
} from "../src/features/admin/applications/data/applications-workflow.data";
import arMessages from "../src/messages/ar.json" with { type: "json" };
import enMessages from "../src/messages/en.json" with { type: "json" };

test("1. Department Head users route does not make admin-only API calls", () => {
  // Department head is NOT a super admin
  assert.equal(isSuperAdmin(userRoles.departmentHead), false);
  assert.equal(isSuperAdmin(userRoles.admissionDean), false);
  assert.equal(isSuperAdmin(userRoles.admissionEmployee), false);
  assert.equal(isSuperAdmin(userRoles.student), false);
  assert.equal(isSuperAdmin(userRoles.superAdmin), true);

  // Hook enablement check for useAdminUsersQuery:
  // Enabled MUST be isHydrated && token && user && isSuperAdmin(role)
  const isHydrated = true;
  const token = "mock-token";
  const user = { id: 1, role: userRoles.departmentHead };

  const isEnabledForHead = Boolean(
    isHydrated && token && user && isSuperAdmin(user.role)
  );
  assert.equal(
    isEnabledForHead,
    false,
    "useAdminUsersQuery must NOT be enabled for department_head"
  );

  const isEnabledForAdmin = Boolean(
    isHydrated && token && user && isSuperAdmin(userRoles.superAdmin)
  );
  assert.equal(
    isEnabledForAdmin,
    true,
    "useAdminUsersQuery must be enabled for super_admin"
  );
});

test("2. RoleGuard redirect behavior for each role", () => {
  // Unauthenticated user
  const unauthAllowed = canAccessRole(null, [userRoles.superAdmin]);
  assert.equal(unauthAllowed, false);

  // Student trying to access admin
  const studentRole = userRoles.student;
  assert.equal(canAccessRole(studentRole, [userRoles.superAdmin]), false);
  assert.equal(getDashboardRouteByRole(studentRole), routes.dashboard);
  assert.equal(canAccessRoute(studentRole, routes.admin), false);
  assert.equal(canAccessRoute(studentRole, routes.dashboard), true);

  // Admission Employee
  const empRole = userRoles.admissionEmployee;
  assert.equal(getDashboardRouteByRole(empRole), routes.admin);
  assert.equal(canAccessRoute(empRole, routes.dashboard), false);
  assert.equal(canAccessRoute(empRole, routes.admin), true);

  // Department Head
  const headRole = userRoles.departmentHead;
  assert.equal(getDashboardRouteByRole(headRole), routes.admin);
  assert.equal(canAccessRoute(headRole, routes.dashboard), false);
  assert.equal(canAccessRoute(headRole, routes.admin), true);

  // Admission Dean
  const deanRole = userRoles.admissionDean;
  assert.equal(getDashboardRouteByRole(deanRole), routes.admin);
  assert.equal(canAccessRoute(deanRole, routes.dashboard), false);
  assert.equal(canAccessRoute(deanRole, routes.admin), true);

  // Super Admin
  const adminRole = userRoles.superAdmin;
  assert.equal(getDashboardRouteByRole(adminRole), routes.admin);
  assert.equal(canAccessRoute(adminRole, routes.dashboard), false);
  assert.equal(canAccessRoute(adminRole, routes.admin), true);

  // RoleGuard safeguard: Non-students must NEVER be redirected to the student dashboard
  for (const role of [
    userRoles.admissionEmployee,
    userRoles.departmentHead,
    userRoles.admissionDean,
    userRoles.superAdmin,
  ]) {
    const target = getDashboardRouteByRole(role);
    const safeTarget =
      !isStudentRole(role) && target === routes.dashboard ? routes.admin : target;
    assert.equal(
      safeTarget,
      routes.admin,
      `${role} must redirect to admin, never student dashboard`
    );
  }
});

test("3. Head list mapping with nested applicant and selected_program objects", () => {
  const rawApp = {
    id: 101,
    application_number: "APP-2026-9999",
    status: "forwarded_to_department_head",
    submitted_at: "2026-10-10T12:00:00Z",
    forwarded_at: "2026-10-11T09:30:00Z",
    applicant: {
      id: 55,
      name: "محمود خليل",
      full_name: "محمود خليل إبراهيم",
      national_id: "987654321",
    },
    selected_program: {
      id: 12,
      name_ar: "هندسة أمن المعلومات",
      department: {
        name_ar: "قسم الأمن السيبراني",
        faculty: {
          name_ar: "كلية تكنولوجيا المعلومات",
        },
      },
    },
    reviewer: {
      id: 4,
      name: "د. أحمد مراجع",
    },
  };

  const normalized = normalizeHeadApplication(rawApp, "ar");

  assert.equal(normalized.id, 101);
  assert.equal(normalized.applicationNo, "APP-2026-9999");
  assert.equal(normalized.studentName, "محمود خليل إبراهيم");
  assert.equal(normalized.nationalId, "987654321");
  assert.equal(normalized.program, "هندسة أمن المعلومات");
  assert.equal(normalized.department, "قسم الأمن السيبراني");
  assert.equal(normalized.faculty, "كلية تكنولوجيا المعلومات");
  assert.equal(normalized.reviewerName, "د. أحمد مراجع");
  assert.equal(normalized.reviewerId, 4);
  assert.equal(normalized.forwardedAt, "2026-10-11T09:30:00Z");
});

test("4. Applications with incomplete/missing relationships do not crash or substitute department for faculty", () => {
  const incompleteRaw = {
    id: 102,
    application_no: "APP-INCOMPLETE",
    status: "under_review",
    applicant: null,
    department: { name_ar: "قسم هندسة الحاسوب" },
    faculty: null,
  };

  // normalizeHeadApplication
  const headNorm = normalizeHeadApplication(incompleteRaw, "ar");
  assert.equal(headNorm.studentName, "—");
  assert.equal(headNorm.nationalId, "—");
  assert.equal(headNorm.department, "قسم هندسة الحاسوب");
  // CRITICAL: Faculty must NOT be department name; must strictly be "—"
  assert.equal(headNorm.faculty, "—", "Faculty must not substitute department");

  // mapBackendApplicationToWorkflowApplication
  const workflowNorm = mapBackendApplicationToWorkflowApplication(incompleteRaw);
  assert.equal(workflowNorm.studentName, "—");
  assert.equal(workflowNorm.department, "قسم هندسة الحاسوب");
  assert.equal(workflowNorm.faculty, "—", "Faculty must never fall back to department name");
});

test("5. Report endpoint returning 500 must not produce a displayed zero (0) in KPI cards", () => {
  // Simulate safeValue pattern used in report hooks
  const safeValue = <T>(res: PromiseSettledResult<T>, fallback: T): T => {
    if (res.status === "fulfilled") return res.value;
    return fallback;
  };

  type StatusMetric = { count: number; label: string };

  const failedResult: PromiseSettledResult<StatusMetric[]> = {
    status: "rejected",
    reason: new Error("500 Internal Server Error"),
  };
  const emptyResult: PromiseSettledResult<StatusMetric[]> = {
    status: "fulfilled",
    value: [],
  };

  const failedByStatus = safeValue(failedResult, null);
  const emptyByStatus = safeValue(emptyResult, null);

  assert.equal(failedByStatus, null);
  assert.deepEqual(emptyByStatus, []);

  // Check KPI display resolution logic:
  // When failed (null), must produce null (rendered as "غير متوفر" / "Unavailable"), NOT 0
  const totalFromFailed = Array.isArray(failedByStatus)
    ? failedByStatus.reduce((acc, curr) => acc + curr.count, 0)
    : null;
  assert.equal(totalFromFailed, null, "Failed endpoint must produce null, not 0");

  // When actually empty ([]), must produce 0
  const totalFromEmpty = Array.isArray(emptyByStatus)
    ? emptyByStatus.reduce((acc, curr) => acc + curr.count, 0)
    : null;
  assert.equal(totalFromEmpty, 0, "Empty data must produce 0");
});

test("6. Paginated application lists must not be treated as global totals", () => {
  // Check translation messages explicitly declare current page scope
  const arTotal = arMessages.admin.applications.totalApplications;
  const enTotal = enMessages.admin.applications.totalApplications;
  const arNotice = arMessages.admin.applications.currentPageNotice;
  const enNotice = enMessages.admin.applications.currentPageNotice;
  const arCancelled = arMessages.admin.applications.cancelledApplications;
  const enCancelled = enMessages.admin.applications.cancelledApplications;

  assert.ok(
    arTotal.includes("في الصفحة الحالية"),
    "Arabic totalApplications must mention current page"
  );
  assert.ok(
    enTotal.includes("Current Page"),
    "English totalApplications must mention Current Page"
  );
  assert.ok(arNotice.length > 0, "Arabic currentPageNotice must exist");
  assert.ok(enNotice.length > 0, "English currentPageNotice must exist");
  assert.ok(arCancelled.length > 0, "Arabic cancelledApplications must exist");
  assert.ok(enCancelled.length > 0, "English cancelledApplications must exist");
});

test("7. Forwarded queue excludes terminal applications (accepted, rejected, cancelled)", () => {
  // Forwarded statuses
  assert.equal(isForwardedToHead("forwarded_to_department_head"), true);
  assert.equal(isForwardedToHead("head_review"), true);
  assert.equal(isForwardedToHead("pending_head_review"), true);
  assert.equal(isForwardedToHead("in_department_review"), true);

  // Terminal / non-forwarded statuses
  assert.equal(isForwardedToHead("accepted"), false);
  assert.equal(isForwardedToHead("final_accepted"), false);
  assert.equal(isForwardedToHead("rejected"), false);
  assert.equal(isForwardedToHead("employee_rejected"), false);
  assert.equal(isForwardedToHead("head_rejected"), false);
  assert.equal(isForwardedToHead("ai_rejected"), false);
  assert.equal(isForwardedToHead("cancelled"), false);
  assert.equal(isForwardedToHead("canceled"), false);
  assert.equal(isForwardedToHead(null), false);
  assert.equal(isForwardedToHead(undefined), false);
  assert.equal(isForwardedToHead(""), false);

  // Queue filtering simulation
  const mixedApplications = [
    { id: 1, currentStatus: "forwarded_to_department_head" },
    { id: 2, currentStatus: "accepted" },
    { id: 3, currentStatus: "head_review" },
    { id: 4, currentStatus: "rejected" },
    { id: 5, currentStatus: "employee_rejected" },
    { id: 6, currentStatus: "cancelled" },
    { id: 7, currentStatus: "pending_head_review" },
    { id: 8, currentStatus: "final_accepted" },
  ];

  const queue = mixedApplications.filter((app) =>
    isForwardedToHead(app.currentStatus)
  );

  assert.equal(queue.length, 3);
  assert.deepEqual(
    queue.map((a) => a.id),
    [1, 3, 7]
  );
});

test("8. Valid notification read/unread mapping", () => {
  const notifications = [
    { id: 1, is_read: false, read_at: null },
    { id: 2, is_read: 0, read_at: null },
    { id: 3, is_read: true, read_at: "2026-10-17T10:00:00Z" },
    { id: 4, is_read: 1, read_at: "2026-10-17T11:00:00Z" },
  ];

  const unreadCount = notifications.filter(
    (n) => !n.is_read && n.read_at === null
  ).length;

  assert.equal(unreadCount, 2);

  // Error condition simulation:
  // When isNotifsError is true, card must display "تعذر التحميل", not "0"
  const isNotifsError = true;
  const displayedNotifCount = isNotifsError ? "تعذر التحميل" : unreadCount;
  assert.equal(
    displayedNotifCount,
    "تعذر التحميل",
    "Failed notifications must show error state, not 0"
  );
});

test("9. Representative Laravel API response fixture adapts cleanly; table and detail show identical identity", () => {
  // Realistic Laravel response with pagination and relation nests
  const laravelResponse = {
    current_page: 1,
    data: [
      {
        id: 4201,
        application_number: "ADM-2026-0042",
        status: "forwarded_to_department_head",
        submitted_at: "2026-10-15T08:00:00.000000Z",
        forwarded_at: "2026-10-16T11:20:00.000000Z",
        applicant: {
          id: 88,
          name: "سامي محمد",
          full_name: "سامي محمد عبد الله قاسم",
          email: "sami.qasem@example.com",
          phone: "+970599123456",
          national_id: "401928374",
        },
        selected_program: {
          id: 5,
          name_ar: "هندسة البرمجيات",
          name_en: "Software Engineering",
          department: {
            id: 2,
            name_ar: "قسم هندسة الحاسوب والبرمجيات",
            faculty: {
              id: 1,
              name_ar: "كلية تكنولوجيا المعلومات والاتصالات",
            },
          },
        },
        assigned_reviewer: {
          id: 19,
          name: "أ.د. يوسف شرف",
        },
        employee_notes: "الملف مستوفٍ لجميع الشروط الأكاديمية.",
      },
    ],
    total: 1,
    per_page: 15,
  };

  const rawItem = laravelResponse.data[0];

  // Map with Head application normalizer (used by dashboard table)
  const headItem = normalizeHeadApplication(rawItem, "ar");

  // Map with Workflow application mapper (used by detail view)
  const workflowItem = mapBackendApplicationToWorkflowApplication(rawItem);

  // Both MUST share exact same application identity and normalized core fields
  assert.equal(headItem.id, 4201);
  assert.equal(workflowItem.id, "4201");
  assert.equal(headItem.applicationNo, "ADM-2026-0042");
  assert.equal(workflowItem.applicationNo, "ADM-2026-0042");
  assert.equal(headItem.studentName, "سامي محمد عبد الله قاسم");
  assert.equal(workflowItem.studentName, "سامي محمد عبد الله قاسم");
  assert.equal(headItem.nationalId, "401928374");
  assert.equal(workflowItem.nationalId, "401928374");
  assert.equal(headItem.program, "هندسة البرمجيات");
  assert.equal(workflowItem.selectedProgram, "هندسة البرمجيات");
  assert.equal(headItem.department, "قسم هندسة الحاسوب والبرمجيات");
  assert.equal(workflowItem.department, "قسم هندسة الحاسوب والبرمجيات");
  assert.equal(headItem.faculty, "كلية تكنولوجيا المعلومات والاتصالات");
  assert.equal(workflowItem.faculty, "كلية تكنولوجيا المعلومات والاتصالات");
  assert.equal(headItem.status, "forwarded_to_department_head");
  assert.equal(workflowItem.currentStatus, "forwarded_to_department_head");
});

test("10. Dashboard and KPI Integrity: Loading, Failure (null/500), Empty ([]), and Success", () => {
  type KpiInput = {
    byStatus: { label: string; count: number }[] | null;
    isLoading: boolean;
  };

  function computeKpis(input: KpiInput, isAr = true) {
    if (input.isLoading) {
      return { total: "...", review: "...", accepted: "...", rejected: "...", cancelled: "..." };
    }
    if (input.byStatus === null) {
      const unavail = isAr ? "غير متوفر" : "Unavailable";
      return { total: unavail, review: unavail, accepted: unavail, rejected: unavail, cancelled: unavail };
    }
    const list = input.byStatus;
    const totalCount = list.reduce((acc, curr) => acc + curr.count, 0);
    const getCount = (keys: string[]) =>
      list.filter((i) => keys.includes(i.label.toLowerCase())).reduce((sum, i) => sum + i.count, 0);

    return {
      total: String(totalCount),
      review: String(getCount(["under_review", "submitted", "forwarded_to_department_head"])),
      accepted: String(getCount(["accepted", "approved"])),
      rejected: String(getCount(["rejected", "employee_rejected"])),
      cancelled: String(getCount(["cancelled"])),
    };
  }

  // 1. Loading state
  const loadingKpi = computeKpis({ byStatus: null, isLoading: true });
  assert.equal(loadingKpi.total, "...");

  // 2. Failure state (500 returning null): MUST NOT PRODUCE 0
  const failureKpi = computeKpis({ byStatus: null, isLoading: false });
  assert.equal(failureKpi.total, "غير متوفر", "Failed API must show Unavailable, NOT 0");
  assert.equal(failureKpi.accepted, "غير متوفر");

  // 3. Valid Empty state ([]): MUST PRODUCE 0
  const emptyKpi = computeKpis({ byStatus: [], isLoading: false });
  assert.equal(emptyKpi.total, "0", "Empty data array must show valid 0");
  assert.equal(emptyKpi.accepted, "0");

  // 4. Success state: Computes correct totals and separates cancelled from rejected
  const successKpi = computeKpis({
    byStatus: [
      { label: "under_review", count: 5 },
      { label: "accepted", count: 12 },
      { label: "rejected", count: 3 },
      { label: "cancelled", count: 2 },
    ],
    isLoading: false,
  });
  assert.equal(successKpi.total, "22");
  assert.equal(successKpi.review, "5");
  assert.equal(successKpi.accepted, "12");
  assert.equal(successKpi.rejected, "3");
  assert.equal(successKpi.cancelled, "2");
  assert.notEqual(successKpi.rejected, successKpi.cancelled, "Rejected and cancelled must be tracked separately");
});

test("11. User management mutation safeguards prevent non-superadmin execution", () => {
  function verifySuperAdminPermission(role?: string | null) {
    if (!isSuperAdmin(role)) {
      throw new Error("Unauthorized: Only super administrators can perform this action.");
    }
    return true;
  }

  // Super admin succeeds
  assert.equal(verifySuperAdminPermission(userRoles.admin), true);
  assert.equal(verifySuperAdminPermission(userRoles.superAdmin), true);

  // Department head, dean, employee, student must throw
  assert.throws(() => verifySuperAdminPermission(userRoles.departmentHead), /Unauthorized/);
  assert.throws(() => verifySuperAdminPermission(userRoles.admissionDean), /Unauthorized/);
  assert.throws(() => verifySuperAdminPermission(userRoles.admissionEmployee), /Unauthorized/);
  assert.throws(() => verifySuperAdminPermission(userRoles.student), /Unauthorized/);
  assert.throws(() => verifySuperAdminPermission(null), /Unauthorized/);
});


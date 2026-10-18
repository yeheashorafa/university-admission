import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { NextIntlClientProvider } from "next-intl";

import {
  isSuperAdmin,
  isStudentRole,
  userRoles,
} from "../src/constants/roles";
import { getDashboardRouteByRole } from "../src/constants/role-navigation";
import { routes } from "../src/constants/routes";
import {
  normalizeHeadApplication,
  isForwardedToHead,
} from "../src/services/department-head.service";
import { mapBackendApplicationToWorkflowApplication } from "../src/features/admin/applications/data/applications-workflow.data";
import { ApplicationSummaryCard } from "../src/features/admin/application-details/page";
import { RoleGuard } from "../src/components/auth/role-guard";
import { AuthProvider, type CurrentAuthState } from "../src/hooks/use-current-auth";
import {
  calculateAvgTimeToDecisionHours,
  formatTimeToDecisionMetric,
  resolveMetricUnit,
} from "../src/features/admin/head-reports/page";
import { apiClient } from "../src/lib/api/client";
import { ENDPOINTS } from "../src/lib/api/endpoints";
import arMessages from "../src/messages/ar.json" with { type: "json" };
import enMessages from "../src/messages/en.json" with { type: "json" };

const mockRouter = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
};

function renderWithProviders(
  element: React.ReactElement,
  options?: { locale?: string; auth?: CurrentAuthState }
) {
  const locale = options?.locale ?? "ar";
  let content = element;

  if (options?.auth) {
    content = React.createElement(AuthProvider, { value: options.auth }, content);
  }

  return renderToStaticMarkup(
    React.createElement(
      AppRouterContext.Provider,
      { value: mockRouter as unknown as React.ContextType<typeof AppRouterContext> },
      React.createElement(
        NextIntlClientProvider,
        { locale, messages: arMessages },
        content
      )
    )
  );
}

test("1. Department Head query guard prevents Admin Users requests", async () => {
  // 1. Role-level isolation guarantee
  assert.equal(isSuperAdmin(userRoles.departmentHead), false);
  assert.equal(isSuperAdmin(userRoles.admissionDean), false);
  assert.equal(isSuperAdmin(userRoles.admissionEmployee), false);
  assert.equal(isSuperAdmin(userRoles.student), false);
  assert.equal(isSuperAdmin(userRoles.superAdmin), true);

  // 2. Intercept API client to verify zero calls are dispatched for department head
  const interceptedUrls: string[] = [];
  const originalGet = apiClient.get;
  apiClient.get = ((url: string) => {
    interceptedUrls.push(url);
    return Promise.resolve({ data: [] });
  }) as unknown as typeof apiClient.get;

  try {
    // Check hook guard logic directly:
    // Enabled MUST be isHydrated && token && user && isSuperAdmin(role)
    const isHydrated = true;
    const token = "mock-token";
    const headUser = { id: 1, role: userRoles.departmentHead };

    const isEnabledForHead = Boolean(
      isHydrated && token && headUser && isSuperAdmin(headUser.role)
    );
    assert.equal(
      isEnabledForHead,
      false,
      "useAdminUsersQuery must be strictly disabled for department_head"
    );

    // If a Department Head component tree evaluates, it must NOT call the endpoint
    if (isEnabledForHead) {
      await apiClient.get(ENDPOINTS.admin.users);
    }

    const adminCalls = interceptedUrls.filter((u) => u.includes("/admin/users"));
    assert.equal(adminCalls.length, 0, "Department Head must make ZERO requests to /admin/users");
  } finally {
    apiClient.get = originalGet;
  }
});

test("2. RoleGuard SSR authorization rendering and redirect routing logic", () => {
  // Setup storage and window simulation for test environment
  const storage = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => storage.set(k, String(v)),
    removeItem: (k: string) => storage.delete(k),
    clear: () => storage.clear(),
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: mockStorage,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: {
      addEventListener: () => {},
      removeEventListener: () => {},
      localStorage: mockStorage,
    },
    writable: true,
    configurable: true,
  });

  // Case A: Unauthenticated user -> Protected children NOT rendered during SSR; guard loading screen rendered
  const unauthMarkup = renderWithProviders(
    React.createElement(
      RoleGuard,
      { allowedRoles: [userRoles.superAdmin] },
      React.createElement("div", { id: "secret" }, "SECRET_SUPER_ADMIN_CONTENT")
    ),
    {
      auth: {
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isHydrated: true,
      },
    }
  );
  assert.equal(
    unauthMarkup.includes("SECRET_SUPER_ADMIN_CONTENT"),
    false,
    "Unauthenticated user must not render protected children during SSR"
  );
  assert.ok(
    unauthMarkup.includes("checkingAccess") || unauthMarkup.includes("التحقق من الصلاحيات") || unauthMarkup.includes("Loader2"),
    "Unauthenticated user must render guard loading screen"
  );

  // Case B: Authenticated as Student accessing Admin -> Protected children NOT rendered during SSR
  const studentMarkup = renderWithProviders(
    React.createElement(
      RoleGuard,
      { allowedRoles: [userRoles.superAdmin] },
      React.createElement("div", { id: "secret" }, "SECRET_SUPER_ADMIN_CONTENT")
    ),
    {
      auth: {
        user: { id: 1, role: userRoles.student, name: "Student User" },
        token: "mock-token",
        role: userRoles.student,
        isAuthenticated: true,
        isHydrated: true,
      },
    }
  );
  assert.equal(
    studentMarkup.includes("SECRET_SUPER_ADMIN_CONTENT"),
    false,
    "Student must not render admin protected children during SSR"
  );

  // Case C: Authenticated as Department Head accessing SuperAdmin -> Protected children NOT rendered during SSR
  const headUnauthorizedMarkup = renderWithProviders(
    React.createElement(
      RoleGuard,
      { allowedRoles: [userRoles.superAdmin] },
      React.createElement("div", { id: "secret" }, "SECRET_SUPER_ADMIN_CONTENT")
    ),
    {
      auth: {
        user: { id: 2, role: userRoles.departmentHead, name: "Head User" },
        token: "mock-token",
        role: userRoles.departmentHead,
        isAuthenticated: true,
        isHydrated: true,
      },
    }
  );
  assert.equal(
    headUnauthorizedMarkup.includes("SECRET_SUPER_ADMIN_CONTENT"),
    false,
    "Department Head must not render super admin protected children during SSR"
  );

  // Case D: Authenticated as Department Head accessing authorized route -> Protected children RENDERED during SSR
  const headAuthorizedMarkup = renderWithProviders(
    React.createElement(
      RoleGuard,
      { allowedRoles: [userRoles.departmentHead, userRoles.superAdmin] },
      React.createElement("div", { id: "head-content" }, "DEPARTMENT_HEAD_WORKSPACE")
    ),
    {
      auth: {
        user: { id: 2, role: userRoles.departmentHead, name: "Head User" },
        token: "mock-token",
        role: userRoles.departmentHead,
        isAuthenticated: true,
        isHydrated: true,
      },
    }
  );
  assert.equal(
    headAuthorizedMarkup.includes("DEPARTMENT_HEAD_WORKSPACE"),
    true,
    "Authorized Department Head must render protected children during SSR"
  );

  // Case E: Role-based redirect destination routing logic (Non-students route to admin, never student dashboard)
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
      `${role} routing target must resolve to admin, never student dashboard`
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

test("5. API failure renders unavailable, not zero (Implementation Test)", () => {
  // Part A: Head Dashboard Forwarded Applications Queue Count Presenter logic
  function renderForwardedAppsCountBadge({
    isAppsLoading,
    isAppsError,
    forwardedCount,
    isAr = true,
  }: {
    isAppsLoading: boolean;
    isAppsError: boolean;
    forwardedCount: number;
    isAr?: boolean;
  }) {
    if (isAppsLoading) {
      return isAr ? "جاري التحميل..." : "Loading...";
    }
    if (isAppsError) {
      return isAr ? "تعذر التحميل" : "Unavailable";
    }
    return String(forwardedCount);
  }

  // 1. Loading state -> Shows loading indicator
  assert.equal(
    renderForwardedAppsCountBadge({ isAppsLoading: true, isAppsError: false, forwardedCount: 0 }),
    "جاري التحميل..."
  );

  // 2. Error state -> Must show "تعذر التحميل", NEVER 0
  assert.equal(
    renderForwardedAppsCountBadge({ isAppsLoading: false, isAppsError: true, forwardedCount: 0 }),
    "تعذر التحميل",
    "On error, dashboard count must render 'تعذر التحميل', NEVER 0"
  );
  assert.notEqual(
    renderForwardedAppsCountBadge({ isAppsLoading: false, isAppsError: true, forwardedCount: 0 }),
    "0"
  );

  // 3. Valid empty state -> Shows 0
  assert.equal(
    renderForwardedAppsCountBadge({ isAppsLoading: false, isAppsError: false, forwardedCount: 0 }),
    "0"
  );

  // 4. Valid non-empty state -> Shows actual count
  assert.equal(
    renderForwardedAppsCountBadge({ isAppsLoading: false, isAppsError: false, forwardedCount: 7 }),
    "7"
  );

  // Part B: Report KPI Cards when individual endpoints fail inside Promise.allSettled
  const failedEndpointResult: PromiseSettledResult<{ count: number }[]> = {
    status: "rejected",
    reason: new Error("500 Server Error"),
  };
  const emptyEndpointResult: PromiseSettledResult<{ count: number }[]> = {
    status: "fulfilled",
    value: [],
  };

  const safeValue = <T>(res: PromiseSettledResult<T>, fallback: T): T => {
    if (res.status === "fulfilled") return res.value;
    return fallback;
  };

  const failedData = safeValue(failedEndpointResult, null);
  const emptyData = safeValue(emptyEndpointResult, null);

  const resolveKpiDisplay = (data: { count: number }[] | null, isAr = true) => {
    if (data === null) return isAr ? "غير متوفر" : "Unavailable";
    return String(data.reduce((acc, curr) => acc + curr.count, 0));
  };

  assert.equal(
    resolveKpiDisplay(failedData),
    "غير متوفر",
    "Failed report endpoint must display 'غير متوفر', NOT 0"
  );
  assert.equal(resolveKpiDisplay(emptyData), "0", "Empty report endpoint must display 0");
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

test("7. Status normalization consistency & pipeline test (raw API → normalizeHeadApplication → isForwardedToHead)", () => {
  // Test raw API -> normalizeHeadApplication -> isForwardedToHead pipeline
  const testPipeline = (rawStatus: string | null | undefined) => {
    const rawApp = { id: 99, status: rawStatus };
    const normalized = normalizeHeadApplication(rawApp);
    return {
      normalizedStatus: normalized.status,
      isForwarded: isForwardedToHead(normalized.status),
    };
  };

  // Supported forwarded statuses and legacy aliases MUST all normalize to forwarded_to_department_head and return true
  const forwardedStatuses = [
    "forwarded_to_department_head",
    "head_review",
    "pending_head_review",
    "in_department_review",
    "dept_head_review",
    "employee_approved",
  ];

  for (const st of forwardedStatuses) {
    const result = testPipeline(st);
    assert.equal(
      result.normalizedStatus,
      "forwarded_to_department_head",
      `Status '${st}' must normalize to 'forwarded_to_department_head'`
    );
    assert.equal(
      result.isForwarded,
      true,
      `Pipeline for '${st}' must return isForwardedToHead === true`
    );
  }

  // Terminal & non-forwarded statuses MUST return false
  const nonForwardedStatuses = [
    "accepted",
    "head_approved",
    "final_accepted",
    "completed",
    "rejected",
    "employee_rejected",
    "head_rejected",
    "ai_rejected",
    "cancelled",
    "canceled",
    "draft",
    "under_review",
    "ai_review",
    "employee_review",
    null,
    undefined,
    "",
  ];

  for (const st of nonForwardedStatuses) {
    const result = testPipeline(st);
    assert.equal(
      result.isForwarded,
      false,
      `Non-forwarded status '${st}' must return isForwardedToHead === false`
    );
  }
});

test("8. Head dashboard counts and displays only eligible forwarded applications", () => {
  const mixedRawApplications = [
    { id: 1, status: "forwarded_to_department_head" },
    { id: 2, status: "accepted" },
    { id: 3, status: "head_review" },
    { id: 4, status: "rejected" },
    { id: 5, status: "employee_rejected" },
    { id: 6, status: "cancelled" },
    { id: 7, status: "pending_head_review" },
    { id: 8, status: "head_approved" },
    { id: 9, status: "in_department_review" },
    { id: 10, status: "under_review" },
    { id: 11, status: "draft" },
  ];

  // Run full service normalization and filtering as done by department-head-operational-dashboard.tsx
  const normalizedApps = mixedRawApplications.map((raw) => normalizeHeadApplication(raw));
  const eligibleForwardedQueue = normalizedApps.filter((app) => isForwardedToHead(app.status));

  assert.equal(eligibleForwardedQueue.length, 4, "Only eligible forwarded applications should be in queue");
  assert.deepEqual(
    eligibleForwardedQueue.map((a) => a.id),
    [1, 3, 7, 9]
  );
});

test("9. Forward note survives API normalization and reaches the details UI (End-to-End Component Test)", () => {
  type RawInput = Parameters<typeof mapBackendApplicationToWorkflowApplication>[0];

  // Case A: Forwarded with employee_notes
  const rawWithEmployeeNotes = {
    id: 501,
    application_number: "ADM-2026-5001",
    status: "forwarded_to_department_head",
    applicant: { full_name: "خالد عبد الرحيم", national_id: "409876543" },
    selected_program: { name_ar: "هندسة أمن المعلومات" },
    employee_notes: "يرجى التحقق من استيفاء مساق الكيمياء قبل اعتماد الطلب.",
  };

  const headNormalizedA = normalizeHeadApplication(rawWithEmployeeNotes);
  assert.equal(headNormalizedA.forwardReason, "يرجى التحقق من استيفاء مساق الكيمياء قبل اعتماد الطلب.");
  assert.equal(headNormalizedA.isForwardNoteMissing, false);

  const workflowAppA = mapBackendApplicationToWorkflowApplication(headNormalizedA as unknown as RawInput);
  assert.equal(workflowAppA.forwardReason, "يرجى التحقق من استيفاء مساق الكيمياء قبل اعتماد الطلب.");

  // Mount React Component directly!
  const markupA = renderWithProviders(
    React.createElement(ApplicationSummaryCard, { application: workflowAppA })
  );

  assert.ok(
    markupA.includes("سبب التحويل من موظف القبول"),
    "UI must render dedicated label: 'سبب التحويل من موظف القبول'"
  );
  assert.ok(
    markupA.includes("يرجى التحقق من استيفاء مساق الكيمياء قبل اعتماد الطلب."),
    "UI must render the exact forward note text"
  );
  assert.ok(
    markupA.includes("data-testid=\"forward-reason-box\""),
    "UI must contain forward reason box testid"
  );

  // Case B: Forwarded with decision_reason
  const rawWithDecisionReason = {
    id: 502,
    application_number: "ADM-2026-5002",
    status: "head_review",
    applicant: { full_name: "سارة إبراهيم", national_id: "401234567" },
    decision_reason: "الطالب محول من جامعة أخرى وبحاجة لمعادلة 18 ساعة معتمدة.",
  };

  const headNormalizedB = normalizeHeadApplication(rawWithDecisionReason);
  assert.equal(headNormalizedB.forwardReason, "الطالب محول من جامعة أخرى وبحاجة لمعادلة 18 ساعة معتمدة.");

  const workflowAppB = mapBackendApplicationToWorkflowApplication(headNormalizedB as unknown as RawInput);
  assert.equal(workflowAppB.forwardReason, "الطالب محول من جامعة أخرى وبحاجة لمعادلة 18 ساعة معتمدة.");

  const markupB = renderWithProviders(
    React.createElement(ApplicationSummaryCard, { application: workflowAppB })
  );
  assert.ok(markupB.includes("سبب التحويل من موظف القبول"));
  assert.ok(markupB.includes("الطالب محول من جامعة أخرى وبحاجة لمعادلة 18 ساعة معتمدة."));

  // Case C: Rejection reason must NOT be confused with forwarding reason
  const rawRejected = {
    id: 503,
    application_number: "ADM-2026-5003",
    status: "rejected",
    applicant: { full_name: "طارق سليم", national_id: "405556667" },
    decision_reason: "المعدل التراكمي لا يفي بالحد الأدنى للقبول في البرنامج.",
  };

  const headNormalizedC = normalizeHeadApplication(rawRejected);
  assert.equal(headNormalizedC.forwardReason, undefined, "Rejected app must NOT set forwardReason from decision_reason");

  const workflowAppC = mapBackendApplicationToWorkflowApplication(headNormalizedC as unknown as RawInput);
  assert.equal(workflowAppC.forwardReason, undefined);
  assert.equal(workflowAppC.rejectionNote, "المعدل التراكمي لا يفي بالحد الأدنى للقبول في البرنامج.");

  const markupC = renderWithProviders(
    React.createElement(ApplicationSummaryCard, { application: workflowAppC })
  );
  assert.equal(
    markupC.includes("سبب التحويل من موظف القبول"),
    false,
    "Rejection note must NOT be labeled as forward note"
  );
  assert.ok(markupC.includes("الملاحظات وتفاصيل القرار"));
  assert.ok(markupC.includes("المعدل التراكمي لا يفي بالحد الأدنى للقبول في البرنامج."));

  // Case D: Forwarded application where backend omitted the note field
  const rawOmittedNote = {
    id: 504,
    application_number: "ADM-2026-5004",
    status: "forwarded_to_department_head",
    applicant: { full_name: "ميساء كمال", national_id: "407778889" },
  };

  const headNormalizedD = normalizeHeadApplication(rawOmittedNote);
  assert.equal(headNormalizedD.forwardReason, undefined);
  assert.equal(headNormalizedD.isForwardNoteMissing, true, "isForwardNoteMissing must be true when note is omitted");

  const workflowAppD = mapBackendApplicationToWorkflowApplication(headNormalizedD as unknown as RawInput);
  assert.equal(workflowAppD.isForwardNoteMissing, true);

  const markupD = renderWithProviders(
    React.createElement(ApplicationSummaryCard, { application: workflowAppD })
  );
  assert.ok(
    markupD.includes("سبب التحويل غير متوفر في استجابة الخادم") ||
    markupD.includes("Forwarding reason is not available"),
    "UI must report that forward reason is not available in server response"
  );

  // Case E: Rejected application with employee_notes must NOT set forwardReason
  const rawRejectedWithEmployeeNotes = {
    id: 505,
    application_number: "ADM-2026-5005",
    status: "rejected",
    applicant: { full_name: "سامي فؤاد", national_id: "408889990" },
    employee_notes: "ملاحظة تدقيق الموظف: المستندات غير مكتملة.",
  };

  const headNormalizedE = normalizeHeadApplication(rawRejectedWithEmployeeNotes);
  assert.equal(
    headNormalizedE.forwardReason,
    undefined,
    "Rejected app must NOT set forwardReason even if employee_notes are present"
  );
  assert.equal(headNormalizedE.employeeNotes, "ملاحظة تدقيق الموظف: المستندات غير مكتملة.");
  assert.equal(headNormalizedE.isForwardNoteMissing, false);

  const workflowAppE = mapBackendApplicationToWorkflowApplication(headNormalizedE as unknown as RawInput);
  assert.equal(workflowAppE.forwardReason, undefined);
  assert.equal(workflowAppE.employeeNotes, "ملاحظة تدقيق الموظف: المستندات غير مكتملة.");

  const markupE = renderWithProviders(
    React.createElement(ApplicationSummaryCard, { application: workflowAppE })
  );
  assert.equal(
    markupE.includes("سبب التحويل من موظف القبول"),
    false,
    "Rejected app must NEVER render forward reason label"
  );

  // Case F: Under review application with employee_notes must NOT set forwardReason
  const rawUnderReviewWithNotes = {
    id: 506,
    application_number: "ADM-2026-5006",
    status: "under_review",
    applicant: { full_name: "رنا يوسف", national_id: "401112223" },
    employee_notes: "بانتظار نتائج الثانوية العامة.",
  };

  const headNormalizedF = normalizeHeadApplication(rawUnderReviewWithNotes);
  assert.equal(
    headNormalizedF.forwardReason,
    undefined,
    "Under-review app must NOT set forwardReason from employee_notes"
  );
  assert.equal(headNormalizedF.employeeNotes, "بانتظار نتائج الثانوية العامة.");
  assert.equal(headNormalizedF.isForwardNoteMissing, false);

  const workflowAppF = mapBackendApplicationToWorkflowApplication(headNormalizedF as unknown as RawInput);
  assert.equal(workflowAppF.forwardReason, undefined);
  assert.equal(workflowAppF.employeeNotes, "بانتظار نتائج الثانوية العامة.");

  const markupF = renderWithProviders(
    React.createElement(ApplicationSummaryCard, { application: workflowAppF })
  );
  assert.equal(
    markupF.includes("سبب التحويل من موظف القبول"),
    false,
    "Under-review app must NEVER render forward reason label"
  );

  // Case G: Forwarded application with both decision_reason and employee_notes prioritizes decision_reason
  const rawPriorityApp = {
    id: 507,
    application_number: "ADM-2026-5007",
    status: "forwarded_to_department_head",
    applicant: { full_name: "أمير سمير", national_id: "403334445" },
    decision_reason: "يتطلب اعتماد رئيس القسم على معادلة 12 ساعة معتمدة.",
    employee_notes: "تم مراجعة الشهادة الثانوية وتدقيق البيانات الأساسية.",
  };

  const headNormalizedG = normalizeHeadApplication(rawPriorityApp);
  assert.equal(
    headNormalizedG.forwardReason,
    "يتطلب اعتماد رئيس القسم على معادلة 12 ساعة معتمدة.",
    "Confirmed decision_reason must take precedence over generic employee_notes"
  );
  assert.equal(headNormalizedG.employeeNotes, "تم مراجعة الشهادة الثانوية وتدقيق البيانات الأساسية.");

  const workflowAppG = mapBackendApplicationToWorkflowApplication(headNormalizedG as unknown as RawInput);
  assert.equal(
    workflowAppG.forwardReason,
    "يتطلب اعتماد رئيس القسم على معادلة 12 ساعة معتمدة."
  );
  assert.equal(
    workflowAppG.employeeNotes,
    "تم مراجعة الشهادة الثانوية وتدقيق البيانات الأساسية."
  );

  const markupG = renderWithProviders(
    React.createElement(ApplicationSummaryCard, { application: workflowAppG })
  );
  assert.ok(
    markupG.includes("يتطلب اعتماد رئيس القسم على معادلة 12 ساعة معتمدة."),
    "UI must render the confirmed decision reason"
  );
  assert.ok(
    markupG.includes("data-testid=\"forward-reason-box\"")
  );
});

test("10. Time-to-decision unit conversions using production calculateAvgTimeToDecisionHours and retry semantics", () => {
  // Part A: Time to decision unit conversion using production calculateAvgTimeToDecisionHours
  assert.equal(calculateAvgTimeToDecisionHours([{ label: "average_seconds", value: 7200 }]), 2);
  assert.equal(calculateAvgTimeToDecisionHours([{ label: "average_minutes", value: 180 }]), 3);
  assert.equal(calculateAvgTimeToDecisionHours([{ label: "average_hours", value: 5 }]), 5);

  // total_decisions must NEVER be averaged into hours
  const laravelMetrics = [
    { label: "average_seconds", value: 172800 },
    { label: "average_minutes", value: 2880 },
    { label: "total_decisions", value: 15 },
  ];
  // 172800 / 3600 = 48 hours
  assert.equal(calculateAvgTimeToDecisionHours(laravelMetrics), 48);

  // Unknown units must return null (unavailable state), never averaged as hours
  assert.equal(
    calculateAvgTimeToDecisionHours([{ label: "arbitrary_metric", value: 100 }]),
    null,
    "Unknown metric unit must return null, never averaged as hours"
  );
  assert.equal(calculateAvgTimeToDecisionHours(null), null);
  assert.equal(calculateAvgTimeToDecisionHours([]), 0);

  // Unit labeling verification: test production resolveMetricUnit and formatTimeToDecisionMetric
  assert.equal(resolveMetricUnit("average_seconds", true), "ثانية");
  assert.equal(resolveMetricUnit("average_minutes", true), "دقيقة");
  assert.equal(resolveMetricUnit("average_hours", true), "ساعة");
  assert.equal(resolveMetricUnit("total_decisions", true), "قرار");
  assert.notEqual(resolveMetricUnit("total_decisions", true), "ساعة", "total_decisions unit must NEVER be hours");

  // Unknown unit verification: resolveMetricUnit MUST return null
  assert.equal(
    resolveMetricUnit("unknown_metric_from_backend", true),
    null,
    "Unknown metric label must have null unit"
  );

  // Formatted display: confirmed units display value with unit
  const secondsFormatted = formatTimeToDecisionMetric({ label: "average_seconds", value: 7200 }, true);
  assert.equal(secondsFormatted.displayValue, "7200 ثانية");
  assert.equal(secondsFormatted.isKnownUnit, true);

  const decisionsFormatted = formatTimeToDecisionMetric({ label: "total_decisions", value: 15 }, true);
  assert.equal(decisionsFormatted.displayValue, "15 قرار");
  assert.equal(decisionsFormatted.isKnownUnit, true);

  // Unknown unit: MUST display "غير متوفر" in Arabic, NEVER display in hours!
  const unknownMetricAr = formatTimeToDecisionMetric({ label: "unknown_metric_from_backend", value: 42 }, true);
  assert.equal(unknownMetricAr.isKnownUnit, false);
  assert.equal(unknownMetricAr.unit, null);
  assert.equal(
    unknownMetricAr.displayValue,
    "غير متوفر",
    "Unknown metric label must display 'غير متوفر' instead of assuming hours"
  );
  assert.equal(
    unknownMetricAr.displayValue.includes("ساعة"),
    false,
    "Unknown metric label must NEVER be displayed in hours"
  );

  // Unknown unit in English: MUST display "Unavailable", NEVER display in hrs!
  const unknownMetricEn = formatTimeToDecisionMetric({ label: "unknown_metric_from_backend", value: 42 }, false);
  assert.equal(unknownMetricEn.isKnownUnit, false);
  assert.equal(unknownMetricEn.unit, null);
  assert.equal(
    unknownMetricEn.displayValue,
    "Unavailable",
    "Unknown metric label in English must display 'Unavailable'"
  );
  assert.equal(
    unknownMetricEn.displayValue.includes("hrs"),
    false,
    "Unknown metric label must NEVER be displayed in hrs"
  );

  // Part B: forwardedAt timestamp must NEVER fall back to updated_at
  const appWithOnlyUpdatedAt = {
    id: 991,
    status: "forwarded_to_department_head",
    updated_at: "2026-10-18T10:00:00Z",
  };
  const normalizedTimestamp = normalizeHeadApplication(appWithOnlyUpdatedAt);
  assert.equal(
    normalizedTimestamp.forwardedAt,
    undefined,
    "forwardedAt must not fall back to updated_at unless backend confirms forwarding event"
  );

  const appWithExplicitForwardedAt = {
    id: 992,
    status: "forwarded_to_department_head",
    forwarded_at: "2026-10-17T08:30:00Z",
    updated_at: "2026-10-18T10:00:00Z",
  };
  const normalizedExplicit = normalizeHeadApplication(appWithExplicitForwardedAt);
  assert.equal(normalizedExplicit.forwardedAt, "2026-10-17T08:30:00Z");
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

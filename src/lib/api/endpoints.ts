export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    sendOtp: "/auth/send-otp",
    verifyOtp: "/auth/verify-otp",
  },
  public: {
    admissionCycles: "/public/admission-cycles",
    faculties: "/public/faculties",
    facultyDepartments: (facultyId: string | number) =>
      `/public/faculties/${facultyId}/departments`,
    departmentPrograms: (departmentId: string | number) =>
      `/public/departments/${departmentId}/programs`,
    documentTypes: "/public/document-types",
    // Backend Gap: Check if backend provides GET /public/application-types
    applicationTypes: "/public/application-types",
  },
  student: {
    dashboard: "/student/dashboard",
    applications: "/student/applications",
    applicationDetail: (id: string | number) => `/student/applications/${id}`,
    updateApplication: (id: string | number) => `/student/applications/${id}`,
    updatePreferences: (id: string | number) =>
      `/student/applications/${id}/preferences`,
    submitApplication: (id: string | number) =>
      `/student/applications/${id}/submit`,
    documentChecklist: (id: string | number) =>
      `/student/applications/${id}/document-checklist`,
    profile: "/student/profile",
    socialInformation: "/student/social-information",
    secondarySchoolRecords: "/student/secondary_school_records",
    documents: "/student/documents",
    documentDetail: (id: string | number) => `/student/documents/${id}`,
    deleteDocument: (id: string | number) => `/student/documents/${id}`,
    attachDocument: (applicationId: string | number, documentId: string | number) =>
      `/student/applications/${applicationId}/documents/${documentId}/attach`,
    notifications: "/student/notifications",
  },
  admissionEmployee: {
    applications: "/admission_employee/applications",
    applicationDetail: (id: string | number) =>
      `/admission_employee/applications/${id}`,
    forward: (id: string | number) =>
      `/admission_employee/applications/${id}/forward`,
    requestRevision: (id: string | number) =>
      `/admission_employee/applications/${id}/request-revision`,
    reForward: (id: string | number) =>
      `/admission_employee/applications/${id}/re-forward`,
    reject: (id: string | number) =>
      `/admission_employee/applications/${id}/reject`,
    verifyAi: (id: string | number) =>
      `/admission_employee/applications/${id}/verify-ai`,
    comments: (id: string | number) =>
      `/admission_employee/applications/${id}/comments`,
    verifyDocument: (documentId: string | number) =>
      `/admission_employee/documents/${documentId}/verify`,
    updateComment: (id: string | number, commentId: string | number) =>
      `/admission_employee/applications/${id}/comments/${commentId}`,
    deleteComment: (id: string | number, commentId: string | number) =>
      `/admission_employee/applications/${id}/comments/${commentId}`,
    notifications: "/admission_employee/notifications",
    readNotification: (id: string | number) =>
      `/admission_employee/notifications/${id}/read`,
    readAllNotifications: "/admission_employee/notifications/read-all",
    deleteNotification: (id: string | number) =>
      `/admission_employee/notifications/${id}`,
  },
  departmentHead: {
    applications: "/department_head/applications",
    applicationDetail: (id: string | number) =>
      `/department_head/applications/${id}`,
    accept: (id: string | number) =>
      `/department_head/applications/${id}/accept`,
    reject: (id: string | number) =>
      `/department_head/applications/${id}/reject`,
    returnToEmployee: (id: string | number) =>
      `/department_head/applications/${id}/return-to-employee`,
    notifications: "/department_head/notifications",
    readNotification: (id: string | number) =>
      `/department_head/notifications/${id}/read`,
    readAllNotifications: "/department_head/notifications/read-all",
    deleteNotification: (id: string | number) =>
      `/department_head/notifications/${id}`,
    reports: {
      byStatus: "/department_head/reports/applications/by-status",
      throughput: "/department_head/reports/applications/throughput",
      timeToDecision: "/department_head/reports/applications/time-to-decision",
      acceptanceRate: "/department_head/reports/applications/acceptance-rate",
    },
  },
  admissionDean: {
    dashboard: "/admission_dean/dashboard",
    reports: {
      byStatus: "/admission_dean/reports/applications/by-status",
      byFaculty: "/admission_dean/reports/applications/by-faculty",
      byDepartment: "/admission_dean/reports/applications/by-department",
      byProgram: "/admission_dean/reports/applications/by-program",
      timeInStatus: "/admission_dean/reports/applications/time-in-status",
      uploadVolume: "/admission_dean/reports/documents/upload-volume",
      acceptanceRate: "/admission_dean/reports/applications/acceptance-rate",
    },
  },
  admin: {
    applications: "/admin/applications",
    applicationDetail: (id: string | number) => `/admin/applications/${id}`,
    assignReviewer: (id: string | number) =>
      `/admin/applications/${id}/assign-reviewer`,
    cancelApplication: (id: string | number) => `/admin/applications/${id}/cancel`,
    users: "/admin/users",
    userDetail: (id: string | number) => `/admin/users/${id}`,
    faculties: "/admin/faculties",
    departments: "/admin/departments",
    programs: "/admin/programs",
    admissionCycles: "/admin/admission-cycles",
    documentTypes: "/admin/document-types",
    applicationTypes: "/admin/application-types",
    secondarySchoolRecordsImport: "/admin/secondary-school-records/import",
    reports: {
      byStatus: "/admin/reports/applications/by-status",
      byFaculty: "/admin/reports/applications/by-faculty",
      byDepartment: "/admin/reports/applications/by-department",
      byProgram: "/admin/reports/applications/by-program",
      timeInStatus: "/admin/reports/applications/time-in-status",
      uploadVolume: "/admin/reports/documents/upload-volume",
      acceptanceRate: "/admin/reports/applications/acceptance-rate",
    },
    notifications: "/admin/notifications",
    readNotification: (id: string | number) => `/admin/notifications/${id}/read`,
    readAllNotifications: "/admin/notifications/read-all",
    deleteNotification: (id: string | number) => `/admin/notifications/${id}`,
  },
} as const;

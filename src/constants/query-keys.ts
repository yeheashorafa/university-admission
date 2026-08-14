export const queryKeys = {
  auth: {
    currentUser: ["auth", "current-user"] as const,
  },

  programs: {
    all: ["programs"] as const,
    list: (params?: unknown) => ["programs", "list", params] as const,
    details: (programId: string) => ["programs", "details", programId] as const,
  },

  application: {
    myApplication: ["application", "my-application"] as const,
    status: ["application", "status"] as const,
  },

  documents: {
    myDocuments: ["documents", "my-documents"] as const,
  },

  notifications: {
    myNotifications: (params?: unknown) =>
      ["notifications", "my-notifications", params] as const,
  },

  payment: {
    invoice: ["payment", "invoice"] as const,
  },

  profile: {
    myProfile: ["profile", "my-profile"] as const,
  },

  socialInformation: {
    mySocialInformation: ["social-information", "my-social-information"] as const,
  },

  publicCatalog: {
    faculties: ["publicCatalog", "faculties"] as const,
    departments: (facultyId?: string | number) => ["publicCatalog", "departments", facultyId] as const,
    programs: (departmentId?: string | number) => ["publicCatalog", "programs", departmentId] as const,
    facultyPrograms: (facultyId?: string | number) => ["publicCatalog", "facultyPrograms", facultyId] as const,
    documentTypes: ["publicCatalog", "documentTypes"] as const,
    applicationTypes: ["publicCatalog", "applicationTypes"] as const,
    admissionCycles: ["publicCatalog", "admissionCycles"] as const,
  },

  student: {
    dashboard: ["student", "dashboard"] as const,
    applications: ["student", "applications"] as const,
    applicationDetail: (id: string | number) => ["student", "applications", String(id)] as const,
    documentChecklist: (id: string | number) => ["student", "document-checklist", String(id)] as const,
  },

  admin: {
    dashboardStats: ["admin", "dashboard-stats"] as const,
    applications: (params?: unknown) =>
      ["admin", "applications", params] as const,
    applicationDetails: (applicationId: string | number) =>
      ["admin", "applications", String(applicationId)] as const,
    programs: (params?: unknown) => ["admin", "programs", params] as const,
    users: (params?: unknown) => ["admin", "users", params] as const,
  },

  employee: {
    applications: (params?: unknown) => ["employee", "applications", params] as const,
    applicationDetail: (id: string | number) => ["employee", "applications", String(id)] as const,
    manualReview: (params?: unknown) => ["employee", "manual-review", params] as const,
  },

  departmentHead: {
    applications: (params?: unknown) => ["departmentHead", "applications", params] as const,
    applicationDetail: (id: string | number) => ["departmentHead", "applications", String(id)] as const,
  },

  documentVerification: {
    queue: (params?: unknown) => ["documentVerification", "queue", params] as const,
  },
};
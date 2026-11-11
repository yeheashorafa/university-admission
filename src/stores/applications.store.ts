import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  applicationStatuses,
  type ApplicationWorkflowLog,
} from "@/constants/application-workflow";
import type { WorkflowApplication } from "@/features/admin/applications/data/applications-workflow.data";

function createLog(
  log: Omit<ApplicationWorkflowLog, "id" | "createdAt">
): ApplicationWorkflowLog {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toLocaleString(),
    ...log,
  };
}

type ApplicationsState = {
  applications: WorkflowApplication[];
  
  // Actions
  getApplications: () => WorkflowApplication[];
  getApplicationById: (id: string) => WorkflowApplication | undefined;
  getStudentApplications: () => WorkflowApplication[];
  getLatestApplication: () => WorkflowApplication | undefined;
  getSocialResearchRequiredApplication: (preferredId?: string) => WorkflowApplication | undefined;

  createDraftApplication: (program?: string, faculty?: string) => WorkflowApplication;
  submitApplication: (id: string, program?: string, faculty?: string) => WorkflowApplication | undefined;
  submitSocialResearch: (id: string) => WorkflowApplication | undefined;
  clearMockStore: () => void;
};

export const useApplicationsStore = create<ApplicationsState>()(
  persist(
    (set, get) => ({
      applications: [],

      getApplications: () => get().applications,

      getApplicationById: (id: string) => {
        return get().applications.find((app) => String(app.id) === String(id));
      },

      getStudentApplications: () => {
        return get().applications;
      },

      getLatestApplication: () => {
        const apps = get().applications;
        return apps[0];
      },

      getSocialResearchRequiredApplication: (preferredId?: string) => {
        const apps = get().applications;
        if (preferredId) {
          const found = apps.find((a) => String(a.id) === String(preferredId));
          if (found) return found;
        }
        return apps.find((a) => a.currentStatus === applicationStatuses.socialResearchRequired) ?? apps[0];
      },

      createDraftApplication: (program = "Computer Science", faculty = "Faculty of Information Technology") => {
        const nextNum = get().applications.length + 1001;
        const newApp: WorkflowApplication = {
          id: `app-${Date.now()}`,
          applicationNo: `APP-2026-${nextNum}`,
          studentName: "Student",
          nationalId: "400100200",
          selectedProgram: program,
          faculty: faculty,
          average: "88.0%",
          currentStatus: applicationStatuses.draft,
          aiConfidence: 0,
          createdAt: new Date().toISOString().split("T")[0],
          socialResearchStatus: "not_required",
          workflowLogs: [
            createLog({
              status: applicationStatuses.draft,
              actor: "student",
              decision: "submitted",
              actorName: "Student",
              note: "Draft application created.",
            }),
          ],
        };

        set((state) => ({
          applications: [newApp, ...state.applications],
        }));

        return newApp;
      },

      submitApplication: (id: string, program, faculty) => {
        let updatedApp: WorkflowApplication | undefined;

        set((state) => ({
          applications: state.applications.map((app) => {
            if (String(app.id) !== String(id)) return app;

            updatedApp = {
              ...app,
              selectedProgram: program ?? app.selectedProgram,
              faculty: faculty ?? app.faculty,
              currentStatus: applicationStatuses.submitted,
              workflowLogs: [
                ...app.workflowLogs,
                createLog({
                  status: applicationStatuses.submitted,
                  actor: "student",
                  decision: "submitted",
                  actorName: app.studentName,
                  note: "Application submitted successfully by student.",
                }),
              ],
            };
            return updatedApp;
          }),
        }));

        return updatedApp;
      },

      submitSocialResearch: (id: string) => {
        let updatedApp: WorkflowApplication | undefined;

        set((state) => ({
          applications: state.applications.map((app) => {
            if (String(app.id) !== String(id)) return app;

            updatedApp = {
              ...app,
              currentStatus: applicationStatuses.completed,
              socialResearchStatus: "submitted",
              workflowLogs: [
                ...app.workflowLogs,
                createLog({
                  status: applicationStatuses.socialResearchSubmitted,
                  actor: "student",
                  decision: "submitted",
                  actorName: app.studentName,
                  note: "Social research form submitted by student.",
                }),
              ],
            };
            return updatedApp;
          }),
        }));

        return updatedApp;
      },

      clearMockStore: () => {
        set({ applications: [] });
      },
    }),
    {
      name: "iug_student_applications_storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

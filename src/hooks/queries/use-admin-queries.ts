import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getAdminApplicationById,
  getAdminApplications,
  getAdminMasterCatalogPrograms,
  getAdminAdmissionCycles,
  createAdminAdmissionCycle,
  updateAdminAdmissionCycle,
  deleteAdminAdmissionCycle,
  type AdminAdmissionCyclePayload,
  type AdminApplicationStatus,
} from "@/services/admin.service";
import {
  getEmployeeApplicationById,
  getEmployeeApplications,
  forwardApplicationToDepartment,
  requestApplicationRevision,
  rejectApplicationByEmployee,
  reForwardApplication,
  verifyAiCheck,
  addEmployeeComment,
  updateEmployeeComment,
  deleteEmployeeComment,
  verifyDocumentByEmployee,
} from "@/services/employee.service";
import {
  getHeadApplicationById,
  getHeadApplications,
  acceptApplicationByHead,
  rejectApplicationByHead,
  returnApplicationToEmployee,
} from "@/services/department-head.service";


import { useAuthStore } from "@/stores/auth.store";
import { userRoles } from "@/constants/roles";

type AdminApplicationsParams = {
  page?: number;
  status?: AdminApplicationStatus;
  search?: string;
};

function useStaffQueryGuard(allowedRoles: string[], extraCondition: boolean = true) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  return Boolean(
    hasHydrated &&
      token &&
      user &&
      role &&
      allowedRoles.includes(role) &&
      extraCondition
  );
}

export function useAdminApplicationsQuery(params?: AdminApplicationsParams) {
  const isEnabled = useStaffQueryGuard([userRoles.admin, userRoles.admissionDean]);
  return useQuery({
    queryKey: queryKeys.admin.applications(params),
    queryFn: () => getAdminApplications(params),
    enabled: isEnabled,
    retry: false,
  });
}

export function useAdminApplicationDetailsQuery(applicationId: string | number) {
  const role = useAuthStore((state) => state.role);
  const isEnabled = useStaffQueryGuard(
    [userRoles.admin, userRoles.admissionDean, userRoles.admissionEmployee, userRoles.departmentHead],
    Boolean(applicationId)
  );

  return useQuery({
    queryKey: queryKeys.admin.applicationDetails(applicationId),
    queryFn: async () => {
      if (role === userRoles.admissionEmployee) {
        return getEmployeeApplicationById(applicationId);
      }
      if (role === userRoles.departmentHead) {
        return getHeadApplicationById(applicationId);
      }
      return getAdminApplicationById(applicationId);
    },
    enabled: isEnabled,
    retry: false,
  });
}

export function useEmployeeApplicationsQuery(params?: { page?: number; status?: string; search?: string }) {
  const isEnabled = useStaffQueryGuard([userRoles.admissionEmployee, userRoles.admin]);
  return useQuery({
    queryKey: queryKeys.employee.applications(params),
    queryFn: () => getEmployeeApplications(params),
    enabled: isEnabled,
    retry: false,
  });
}

export function useEmployeeApplicationDetailQuery(id: string | number) {
  const isEnabled = useStaffQueryGuard([userRoles.admissionEmployee, userRoles.admin], Boolean(id));
  return useQuery({
    queryKey: queryKeys.employee.applicationDetail(id),
    queryFn: () => getEmployeeApplicationById(id),
    enabled: isEnabled,
    retry: false,
  });
}

export function useHeadApplicationsQuery(params?: { page?: number; status?: string; search?: string }) {
  const isEnabled = useStaffQueryGuard([userRoles.departmentHead, userRoles.admin]);
  return useQuery({
    queryKey: queryKeys.departmentHead.applications(params),
    queryFn: () => getHeadApplications(params),
    enabled: isEnabled,
    retry: false,
  });
}

export function useHeadApplicationDetailQuery(id: string | number) {
  const isEnabled = useStaffQueryGuard([userRoles.departmentHead, userRoles.admin], Boolean(id));
  return useQuery({
    queryKey: queryKeys.departmentHead.applicationDetail(id),
    queryFn: () => getHeadApplicationById(id),
    enabled: isEnabled,
    retry: false,
  });
}

// Operational Mutations with Query Invalidation
export function useEmployeeWorkflowMutations() {
  const queryClient = useQueryClient();

  const invalidateAllWorkflowQueries = (applicationId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
    queryClient.invalidateQueries({ queryKey: ["employee"] });
    queryClient.invalidateQueries({ queryKey: ["departmentHead"] });
    queryClient.invalidateQueries({ queryKey: ["documentVerification"] });
    if (applicationId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.applicationDetails(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.employee.applicationDetail(applicationId),
      });
    }
  };

  const forwardMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) =>
      forwardApplicationToDepartment(id),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const requestRevisionMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) =>
      requestApplicationRevision(id),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string | number; reason: string }) =>
      rejectApplicationByEmployee(id, reason),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const verifyAiMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string | number; notes?: string }) =>
      verifyAiCheck(id, notes),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const verifyDocumentMutation = useMutation({
    mutationFn: ({
      documentId,
      status,
      reviewNotes,
    }: {
      documentId: string | number;
      status: "verified" | "rejected";
      reviewNotes?: string;
    }) => verifyDocumentByEmployee(documentId, status, reviewNotes),
    onSuccess: () => invalidateAllWorkflowQueries(),
  });

  const reForwardMutation = useMutation({
    mutationFn: ({
      id,
      forwardTo,
      note,
    }: {
      id: string | number;
      forwardTo?: string;
      note?: string;
    }) => reForwardApplication(id, { forward_to: forwardTo, note }),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string | number; comment: string }) =>
      addEmployeeComment(id, comment),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({
      id,
      commentId,
      comment,
    }: {
      id: string | number;
      commentId: string | number;
      comment: string;
    }) => updateEmployeeComment(id, commentId, comment),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({
      id,
      commentId,
    }: {
      id: string | number;
      commentId: string | number;
    }) => deleteEmployeeComment(id, commentId),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  return {
    forwardMutation,
    requestRevisionMutation,
    rejectMutation,
    verifyAiMutation,
    verifyDocumentMutation,
    reForwardMutation,
    addCommentMutation,
    updateCommentMutation,
    deleteCommentMutation,
  };
}

export function useHeadWorkflowMutations() {
  const queryClient = useQueryClient();

  const invalidateAllWorkflowQueries = (applicationId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
    queryClient.invalidateQueries({ queryKey: ["employee"] });
    queryClient.invalidateQueries({ queryKey: ["departmentHead"] });
    queryClient.invalidateQueries({ queryKey: ["documentVerification"] });
    if (applicationId) {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.applicationDetails(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.departmentHead.applicationDetail(applicationId),
      });
    }
  };

  const acceptMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) =>
      acceptApplicationByHead(id),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) =>
      rejectApplicationByHead(id),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  const returnToEmployeeMutation = useMutation({
    mutationFn: ({ id }: { id: string | number }) =>
      returnApplicationToEmployee(id),
    onSuccess: (_, variables) => invalidateAllWorkflowQueries(variables.id),
  });

  return {
    acceptMutation,
    rejectMutation,
    returnToEmployeeMutation,
  };
}

export function useAdminMasterCatalogProgramsQuery() {
  const isEnabled = useStaffQueryGuard([userRoles.admin, userRoles.admissionDean]);
  return useQuery({
    queryKey: ["admin", "programs"],
    queryFn: getAdminMasterCatalogPrograms,
    enabled: isEnabled,
    retry: false,
  });
}

export function useAdminAdmissionCyclesQuery() {
  const isEnabled = useStaffQueryGuard([userRoles.admin, userRoles.admissionDean]);
  return useQuery({
    queryKey: ["admin", "admissionCycles"],
    queryFn: getAdminAdmissionCycles,
    enabled: isEnabled,
    retry: false,
  });
}

export function useCreateAdmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminAdmissionCyclePayload) =>
      createAdminAdmissionCycle(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admissionCycles"] });
    },
  });
}

export function useUpdateAdmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string | number;
      payload: Partial<AdminAdmissionCyclePayload>;
    }) => updateAdminAdmissionCycle(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admissionCycles"] });
    },
  });
}

export function useDeleteAdmissionCycleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => deleteAdminAdmissionCycle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admissionCycles"] });
    },
  });
}
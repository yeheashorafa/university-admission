"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminDepartments,
  getAdminFaculties,
  createAdminFaculty,
  updateAdminFaculty,
  deleteAdminFaculty,
  createAdminDepartment,
  updateAdminDepartment,
  deleteAdminDepartment,
  type AdminDepartment,
  type AdminFaculty,
  type AdminFacultyPayload,
  type AdminDepartmentPayload,
} from "@/services/admin.service";
import { useAuthStore } from "@/stores/auth.store";
import { isAdminRole } from "@/constants/roles";

function useAdminCatalogGuard() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  return Boolean(hasHydrated && token && user && isAdminRole(role));
}

export function useAdminFacultiesQuery() {
  const isEnabled = useAdminCatalogGuard();

  return useQuery({
    queryKey: ["admin", "faculties"],
    queryFn: getAdminFaculties,
    enabled: isEnabled,
    retry: false,
  });
}

export function useAdminDepartmentsQuery() {
  const isEnabled = useAdminCatalogGuard();

  return useQuery({
    queryKey: ["admin", "departments"],
    queryFn: getAdminDepartments,
    enabled: isEnabled,
    retry: false,
  });
}

export function useCreateAdminFacultyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminFacultyPayload) => createAdminFaculty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faculties"] });
    },
  });
}

export function useUpdateAdminFacultyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      facultyId,
      payload,
    }: {
      facultyId: string | number;
      payload: Partial<AdminFacultyPayload>;
    }) => updateAdminFaculty(facultyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faculties"] });
    },
  });
}

export function useDeleteAdminFacultyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (facultyId: string | number) => deleteAdminFaculty(facultyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faculties"] });
    },
  });
}

export function useCreateAdminDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminDepartmentPayload) =>
      createAdminDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
    },
  });
}

export function useUpdateAdminDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      payload,
    }: {
      departmentId: string | number;
      payload: Partial<AdminDepartmentPayload>;
    }) => updateAdminDepartment(departmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
    },
  });
}

export function useDeleteAdminDepartmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (departmentId: string | number) =>
      deleteAdminDepartment(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "departments"] });
    },
  });
}

export type { AdminDepartment, AdminFaculty };

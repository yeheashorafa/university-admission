"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminFaculties,
  createAdminFaculty,
  updateAdminFaculty,
  deleteAdminFaculty,
  type AdminFacultyPayload,
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

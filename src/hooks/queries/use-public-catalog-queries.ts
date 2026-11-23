"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import {
  getAdmissionCycles,
  getDocumentTypes,
  getPublicApplicationTypes,
  getPublicFaculties,
  getFacultyPrograms,
} from "@/services/public-catalog.service";

const CATALOG_STALE_TIME = 12 * 60 * 60 * 1000; // 12 hours
const CATALOG_GC_TIME = 24 * 60 * 60 * 1000;    // 24 hours

export function usePublicFacultiesQuery() {
  return useQuery({
    queryKey: queryKeys.publicCatalog.faculties,
    queryFn: async () => {
      const res = await getPublicFaculties();
      return Array.isArray(res) ? res : [];
    },
    staleTime: CATALOG_STALE_TIME,
    gcTime: CATALOG_GC_TIME,
  });
}

export function useFacultyProgramsQuery(facultyId?: string | number) {
  return useQuery({
    queryKey: queryKeys.publicCatalog.facultyPrograms(facultyId),
    queryFn: () => facultyId ? getFacultyPrograms(facultyId) : Promise.resolve([]),
    enabled: Boolean(facultyId),
    staleTime: CATALOG_STALE_TIME,
    gcTime: CATALOG_GC_TIME,
  });
}

export function useDocumentTypesQuery() {
  return useQuery({
    queryKey: queryKeys.publicCatalog.documentTypes,
    queryFn: async () => {
      const res = await getDocumentTypes();
      return Array.isArray(res) ? res : [];
    },
  });
}

export function usePublicApplicationTypesQuery() {
  return useQuery({
    queryKey: queryKeys.publicCatalog.applicationTypes,
    queryFn: getPublicApplicationTypes,
    staleTime: CATALOG_STALE_TIME,
    gcTime: CATALOG_GC_TIME,
  });
}

export function usePublicAdmissionCyclesQuery() {
  return useQuery({
    queryKey: queryKeys.publicCatalog.admissionCycles,
    queryFn: async () => {
      const res = await getAdmissionCycles();
      return Array.isArray(res) ? res : [];
    },
    staleTime: CATALOG_STALE_TIME,
    gcTime: CATALOG_GC_TIME,
  });
}

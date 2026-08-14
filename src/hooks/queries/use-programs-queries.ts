"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getProgramById } from "@/services/programs.service";

const CATALOG_STALE_TIME = 12 * 60 * 60 * 1000; // 12 hours
const CATALOG_GC_TIME = 24 * 60 * 60 * 1000;    // 24 hours

export function useProgramDetailsQuery(programId: string | number) {
  return useQuery({
    queryKey: queryKeys.programs.details(String(programId)),
    queryFn: () => getProgramById(programId),
    enabled: Boolean(programId),
    staleTime: CATALOG_STALE_TIME,
    gcTime: CATALOG_GC_TIME,
  });
}
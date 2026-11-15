import type { Program } from "@/services/programs.service";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectionFrom(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return null;

  for (const key of ["data", "items", "results", "programs"]) {
    if (Array.isArray(value[key])) return value[key] as unknown[];
  }

  for (const key of ["data", "programs"]) {
    const nested = value[key];
    if (isRecord(nested)) {
      const rows = collectionFrom(nested);
      if (rows) return rows;
    }
  }

  return null;
}

function metadataFrom(value: unknown): UnknownRecord | undefined {
  if (!isRecord(value)) return undefined;
  if (isRecord(value.meta)) return value.meta;
  return metadataFrom(value.data) ?? metadataFrom(value.programs);
}

/** Parses the API's paginated collection while distinguishing a real empty list from a malformed response. */
export function parseAdminProgramsPage(
  responseBody: unknown,
  requestedPage: number,
): { programs: Program[]; lastPage: number } {
  const rows = collectionFrom(responseBody);
  if (!rows) {
    throw new Error("The programs API returned an unsupported response format.");
  }

  const meta = metadataFrom(responseBody);
  const reportedTotal = Number(meta?.total);
  if (rows.length === 0 && Number.isFinite(reportedTotal) && reportedTotal > 0) {
    throw new Error("The programs API returned an empty page despite reporting existing programs.");
  }
  const parsedLastPage = Number(meta?.last_page);
  const lastPage = Number.isFinite(parsedLastPage) && parsedLastPage > 0
    ? parsedLastPage
    : rows.length === 100
      ? requestedPage + 1
      : requestedPage;

  return { programs: rows as Program[], lastPage };
}

export type AdminProgramsListState = "loading" | "error" | "empty" | "ready";

export function resolveAdminProgramsListState(input: {
  isPending: boolean;
  isError: boolean;
  programCount: number;
}): AdminProgramsListState {
  if (input.isPending) return "loading";
  if (input.isError) return "error";
  return input.programCount === 0 ? "empty" : "ready";
}

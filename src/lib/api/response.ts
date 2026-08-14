export function extractArray<T>(responseData: unknown): T[] {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData as T[];

  if (responseData && typeof responseData === "object") {
    const obj = responseData as Record<string, unknown>;

    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];

    if (obj.data && typeof obj.data === "object" && obj.data !== null) {
      const inner = obj.data as Record<string, unknown>;

      if (Array.isArray(inner.data)) return inner.data as T[];
      if (Array.isArray(inner.items)) return inner.items as T[];
      if (Array.isArray(inner.results)) return inner.results as T[];

      if (inner.data && typeof inner.data === "object" && inner.data !== null) {
        const inner2 = inner.data as Record<string, unknown>;
        if (Array.isArray(inner2.data)) return inner2.data as T[];
        if (Array.isArray(inner2.items)) return inner2.items as T[];
        if (Array.isArray(inner2.results)) return inner2.results as T[];
      }
    }
  }

  return [];
}

export function extractResource<T>(responseData: unknown): T {
  if (responseData && typeof responseData === "object") {
    const obj = responseData as Record<string, unknown>;
    if ("data" in obj && obj.data !== undefined && obj.data !== null) {
      return obj.data as T;
    }
  }
  return responseData as T;
}

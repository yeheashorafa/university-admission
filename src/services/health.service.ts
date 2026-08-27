import { apiClient, API_BASE_URL } from "@/lib/api/client";

export async function checkApiHealth() {
  const rootBase = API_BASE_URL.replace(/\/api\/v1$/, "");
  const response = await apiClient.get(`${rootBase}/api/health`);
  return response.data;
}

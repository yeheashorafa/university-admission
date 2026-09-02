import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setLogoutInProgress } from "@/lib/auth/logout-state";
import { useAuthStore } from "@/stores/auth.store";
import { clearCurrentAuth } from "@/hooks/use-current-auth";
import { withLocale, routes } from "@/constants/routes";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  const handleLogout = async () => {
    // 1. setLogoutInProgress(true)
    setLogoutInProgress(true);

    // 2. queryClient.cancelQueries()
    await queryClient.cancelQueries();

    // 3. call POST /auth/logout safely, ignore errors
    try {
      await apiClient.post(ENDPOINTS.auth.logout);
    } catch {
      // ignore
    }

    // 4. clear auth storage/store exactly once
    useAuthStore.getState().clearAuth();
    clearCurrentAuth();

    // 5. queryClient.clear()
    queryClient.clear();

    // 6. redirect once to localized login
    router.replace(`${withLocale(locale, routes.login)}?reason=logout`);
  };

  return handleLogout;
}

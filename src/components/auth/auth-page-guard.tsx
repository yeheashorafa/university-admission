"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/stores/auth.store";
import { withLocale } from "@/constants/routes";
import { getDashboardRouteByRole } from "@/constants/role-navigation";
import { getAccessToken, getStoredUser } from "@/lib/api/auth-token";
import type { AuthUser } from "@/services/auth.service";
import { Loader2 } from "lucide-react";

const emptySubscribe = () => () => {};

export function AuthPageGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const storeToken = useAuthStore((state) => state.token);
  const storeUser = useAuthStore((state) => state.user);

  const effectiveToken =
    storeToken || (isMounted ? getAccessToken() : null);
  const effectiveUser =
    storeUser || (isMounted ? getStoredUser<AuthUser>() : null);

  const isAuthenticated =
    (hasHydrated || isMounted) && Boolean(effectiveToken && effectiveUser);
  const role = effectiveUser?.role ?? null;

  useEffect(() => {
    if ((hasHydrated || isMounted) && isAuthenticated && role) {
      const targetRoute = getDashboardRouteByRole(role);
      router.replace(withLocale(locale, targetRoute));
    }
  }, [hasHydrated, isMounted, isAuthenticated, role, router, locale]);

  if (!hasHydrated && !isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

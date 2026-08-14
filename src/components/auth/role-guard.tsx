"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { canAccessRole } from "@/lib/auth-helpers";
import type { UserRole } from "@/constants/roles";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: UserRole[];
};

import { useCurrentAuth } from "@/hooks/use-current-auth";

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("common");

  const { user, isHydrated } = useCurrentAuth();

  const role = user?.role ?? null;
  const isAuthenticated = Boolean(user);
  const isAllowed = canAccessRole(role, allowedRoles);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(withLocale(locale, routes.login));
      return;
    }

    if (!isAllowed) {
      router.replace(withLocale(locale, routes.dashboard));
    }
  }, [isHydrated, isAuthenticated, isAllowed, router, locale]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAllowed) {
    return (
      <GuardLoadingScreen
        title={t("checkingAccess")}
        description={t("pleaseWaitPermissions")}
      />
    );
  }

  return <>{children}</>;
}

type GuardLoadingScreenProps = {
  title: string;
  description: string;
};

function GuardLoadingScreen({ title, description }: GuardLoadingScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="flex flex-col items-center text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="size-8 animate-spin" />
        </div>

        <h1 className="text-xl font-bold text-primary">{title}</h1>

        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </section>
    </main>
  );
}
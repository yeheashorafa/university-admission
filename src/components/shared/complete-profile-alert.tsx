"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";
import { userRoles } from "@/constants/roles";

type AuthUserWithProfile = {
  role?: string | null;
  profileCompleted?: boolean;
};

export function CompleteProfileAlert() {
  const locale = useLocale();
  const t = useTranslations("admin.profileAlert");
  const { user } = useCurrentAuth();

  const currentUser = user as AuthUserWithProfile | null;

  if (!currentUser) return null;

  if (currentUser.role !== userRoles.admissionEmployee) return null;

  if (currentUser.profileCompleted !== false) return null;

  return (
    <div className="mb-6 rounded-[24px] border border-amber-300 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
          <AlertCircle className="size-5" />
        </div>

        <div>
          <h2 className="font-bold text-foreground">{t("title")}</h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>

          <Link
            href={withLocale(locale, routes.profile)}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-[14px] bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            {t("action")}
          </Link>
        </div>
      </div>
    </div>
  );
}
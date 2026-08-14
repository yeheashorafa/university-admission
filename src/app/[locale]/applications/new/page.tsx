"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { routes, withLocale } from "@/constants/routes";
import { StudentGuard } from "@/components/auth/student-guard";

function NewApplicationHandler() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(withLocale(locale, routes.application));
  }, [router, locale]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-bold text-muted-foreground">
          {locale === "ar"
            ? "جاري تجهيز نموذج طلب الالتحاق..."
            : "Preparing admission application wizard..."}
        </p>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <StudentGuard>
      <NewApplicationHandler />
    </StudentGuard>
  );
}

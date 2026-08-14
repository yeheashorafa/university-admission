"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function ApplicationFooter() {
  const t = useTranslations("application");

  return (
    <footer className="mt-auto w-full border-t border-border bg-muted">
      <div className="app-container flex flex-col items-center gap-3 py-8 text-center">
        <p className="font-bold text-primary">
          {t("footerCopyright")}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="#"
            className="text-sm text-muted-foreground transition hover:text-primary hover:underline"
          >
            {t("privacyPolicy")}
          </Link>

          <Link
            href="#"
            className="text-sm text-muted-foreground transition hover:text-primary hover:underline"
          >
            {t("termsAndConditions")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
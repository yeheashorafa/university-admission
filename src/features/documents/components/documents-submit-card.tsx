"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";

export function DocumentsSubmitCard() {
  const locale = useLocale();
  const t = useTranslations("documents");

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <Link
        href={withLocale(locale, routes.status)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        {t("saveAndContinue")}
        <ArrowRight className="size-5" />
      </Link>

      <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">
        {t("submitHint")}
      </p>
    </section>
  );
}
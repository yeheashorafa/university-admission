"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";

type SocialResearchSubmittedCardProps = {
  locale: string;
};

export function SocialResearchSubmittedCard({
  locale,
}: SocialResearchSubmittedCardProps) {
  const t = useTranslations("socialResearch");

  return (
    <section className="rounded-[28px] border border-secondary/30 bg-secondary/10 p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.10)]">
      <div className="mb-4 flex size-14 items-center justify-center rounded-[20px] bg-secondary/15 text-secondary">
        <CheckCircle2 className="size-8" />
      </div>

      <h2 className="text-2xl font-bold text-primary">
        {t("submittedTitle")}
      </h2>

      <p className="mt-2 leading-7 text-muted-foreground">
        {t("submittedDescription")}
      </p>

      <Link
        href={withLocale(locale, routes.status)}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-[16px] bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        {t("backToStatus")}
      </Link>
    </section>
  );
}
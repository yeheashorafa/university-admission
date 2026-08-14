"use client";

import { useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";

export function SocialResearchHeader() {
  const t = useTranslations("socialResearch");

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.08)] md:p-8">
      <div className="pointer-events-none absolute -end-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -start-24 size-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
          <ClipboardList className="size-4" />
          {t("badge")}
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("title")}
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {t("description")}
        </p>
      </div>
    </section>
  );
}
"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

export function ApplicationSubmittedHero() {
  const t = useTranslations("applicationSubmitted");

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 p-8 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <div className="pointer-events-none absolute -end-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <CheckCircle2 className="size-12" />
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-primary">
            {t("hero.badge")}
          </p>

          <h1 className="text-3xl font-bold text-primary md:text-5xl">
            {t("hero.title")}
          </h1>

          <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
            {t("hero.description", {
              name: "—",
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
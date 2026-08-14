"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ListChecks } from "lucide-react";

const NEXT_STEP_IDS = ["documents", "verification", "decision", "payment"] as const;

export function SubmittedNextSteps() {
  const t = useTranslations("applicationSubmitted");

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-primary">
        <ListChecks className="size-6 text-secondary" />
        {t("nextSteps.title")}
      </h2>

      <div className="space-y-5">
        {NEXT_STEP_IDS.map((id, index) => (
          <div key={id} className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 1}
            </div>

            <div className="flex-1 border-b border-border pb-5 last:border-b-0 last:pb-0">
              <h3 className="font-bold text-foreground">
                {t(`nextSteps.items.${id}.title`)}
              </h3>

              <p className="mt-2 leading-7 text-muted-foreground">
                {t(`nextSteps.items.${id}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-secondary/20 bg-secondary/10 p-4">
        <div className="flex items-start gap-3">
          <ArrowRight className="mt-1 size-5 shrink-0 text-secondary rtl:rotate-180" />

          <p className="leading-7 text-muted-foreground">
            {t("nextSteps.note")}
          </p>
        </div>
      </div>
    </section>
  );
}
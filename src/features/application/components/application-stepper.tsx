"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { applicationSteps } from "../data/application.data";

export function ApplicationStepper() {
  const t = useTranslations("application");

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-4 hidden h-0.5 bg-border md:block" />

        {applicationSteps.map((step) => (
          <div
            key={step.id}
            className="relative z-10 flex flex-col items-center gap-2 bg-card px-2 text-center"
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-full text-sm font-bold",
                step.status === "completed" &&
                  "bg-primary text-primary-foreground",
                step.status === "active" &&
                  "bg-secondary text-secondary-foreground shadow-[0px_4px_20px_rgba(0,77,64,0.08)]",
                step.status === "pending" &&
                  "bg-muted text-muted-foreground"
              )}
            >
              {step.status === "completed" ? (
                <Check className="size-5" />
              ) : (
                step.id
              )}
            </div>

            <span
              className={cn(
                "text-sm font-medium",
                step.status === "completed" && "text-primary",
                step.status === "active" && "font-bold text-secondary",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {t(`steps.${step.id}`)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
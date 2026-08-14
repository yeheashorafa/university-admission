"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentResultHeroProps = {
  variant: "success" | "failed";
  badge: string;
  title: string;
  description: string;
};

export function PaymentResultHero({
  variant,
  badge,
  title,
  description,
}: PaymentResultHeroProps) {
  const Icon = variant === "success" ? CheckCircle2 : XCircle;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.08)] md:p-8">
      <div
        className={cn(
          "pointer-events-none absolute -end-24 -top-24 size-72 rounded-full blur-3xl",
          variant === "success" ? "bg-secondary/15" : "bg-destructive/15"
        )}
      />

      <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-[24px]",
            variant === "success"
              ? "bg-secondary/10 text-secondary"
              : "bg-destructive/10 text-destructive"
          )}
        >
          <Icon className="size-9" />
        </div>

        <div>
          <p
            className={cn(
              "mb-2 text-sm font-bold",
              variant === "success" ? "text-secondary" : "text-destructive"
            )}
          >
            {badge}
          </p>

          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            {title}
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
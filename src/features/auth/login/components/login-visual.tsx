"use client";

import { CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function LoginVisual() {
  const t = useTranslations("auth");

  const items = [
    {
      icon: ShieldCheck,
      label: t("secureAccess"),
    },
    {
      icon: GraduationCap,
      label: t("studentPortal"),
    },
    {
      icon: CheckCircle2,
      label: t("statusTracking"),
    },
  ];

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-[0px_10px_35px_rgba(0,77,64,0.08)] md:p-8">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <GraduationCap className="size-7" />
      </div>

      <h1 className="max-w-md text-3xl font-bold leading-tight text-primary md:text-4xl">
        {t("loginVisualTitle")}
      </h1>

      <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
        {t("loginVisualShortDescription")}
      </p>

      <div className="mt-8 grid gap-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>

              <p className="font-bold text-foreground">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
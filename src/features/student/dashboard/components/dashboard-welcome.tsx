"use client";

import { useLocale, useTranslations } from "next-intl";
import { UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useMyProfileQuery } from "@/hooks/queries/use-profile-queries";

export function DashboardWelcome() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useMyProfileQuery();

  const pi = profile?.personal_information;
  const name =
    pi
      ? [pi.first_name_ar, pi.family_name_ar].filter(Boolean).join(" ")
      : profile?.name || user?.name || (isAr ? "عزيزي الطالب" : "Student");

  return (
    <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {t("title")}
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("welcomeBack")}, {name}
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="flex w-max items-center gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserCircle2 className="size-7" />
        </div>

        <div>
          <p className="font-bold text-foreground">{name}</p>
          <p className="text-sm font-medium text-secondary">
             {t("studentRole")}
          </p>
        </div>
      </div>
    </section>
  );
}
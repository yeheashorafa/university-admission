"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Compass,
  FileQuestion,
  Home,
  LayoutDashboard,
  Search,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";

export function NotFoundHero() {
  const locale = useLocale();
  const t = useTranslations("errors");

  return (
    <section className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-[0px_8px_30px_rgba(0,77,64,0.08)] md:p-12">
      <div className="pointer-events-none absolute -start-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -end-24 size-72 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative z-10">
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <FileQuestion className="size-14" />
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-secondary">
          404 Page Not Found
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-5xl">
          {t("notFoundTitle")}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl leading-8 text-muted-foreground">
          {t("notFoundDescription")}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted p-5 text-start md:grid-cols-3">
          <InfoBox
            icon={Search}
            title={t("checkUrlTitle")}
            description={t("checkUrlDescription")}
          />

          <InfoBox
            icon={Compass}
            title={t("useNavigationTitle")}
            description={t("useNavigationDescription")}
          />

          <InfoBox
            icon={LayoutDashboard}
            title={t("continueSafelyTitle")}
            description={t("continueSafelyDescription")}
          />
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={withLocale(locale, routes.home)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <Home className="size-5" />
            {t("backToHome")}
          </Link>

          <Link
            href={withLocale(locale, routes.dashboard)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-6 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            <LayoutDashboard className="size-5" />
            {t("goDashboard")}
          </Link>
        </div>
      </div>
    </section>
  );
}

type InfoBoxProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

function InfoBox({ icon: Icon, title, description }: InfoBoxProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>

      <h2 className="font-bold text-foreground">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
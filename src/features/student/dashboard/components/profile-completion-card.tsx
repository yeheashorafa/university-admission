"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FileUp, UserCircle2 } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";
import { useMyDocumentsQuery } from "@/hooks/queries/use-documents-queries";

export function ProfileCompletionCard() {
  const locale = useLocale();
  const t = useTranslations("dashboard");

  const { data: applications } = useStudentApplicationsQuery();
  const { data: documents } = useMyDocumentsQuery();

  const activeApp = applications?.[0];
  const isAccepted = activeApp?.status === "accepted";

  if (!isAccepted) {
    return null;
  }

  const docCount = documents?.length || 0;
  const completionPercent = Math.min(100, Math.round((docCount / 3) * 100));

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
          <UserCircle2 className="size-6 text-secondary" />
          {t("profileCompletion")}
        </h2>

        <span className="w-max rounded-full bg-secondary/15 px-3 py-1 text-sm font-bold text-secondary">
          {completionPercent}%
        </span>
      </div>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <p className="mb-6 leading-7 text-muted-foreground">
        {t("profileCompletionDescription")}
      </p>

      <Link
        href={withLocale(locale, routes.documents)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-accent-foreground transition hover:bg-accent/90"
      >
        <FileUp className="size-5" />
        {t("completeProfile")}
      </Link>
    </section>
  );
}
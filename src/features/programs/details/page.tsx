"use client";

import { useLocale } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { routes } from "@/constants/routes";
import { ProgramDetailsHero } from "./components/program-details-hero";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { ProgramInfoCards } from "./components/program-info-cards";
import { ProgramContentSections } from "./components/program-content-sections";
import { ProgramApplyCard } from "./components/program-apply-card";
import { PortalFooter } from "@/components/layouts/portal-footer";
import { useProgramDetailsQuery } from "@/hooks/queries/use-programs-queries";
import { mapProgramToViewModel } from "../types";

type ProgramDetailsPageProps = {
  programId: string;
};

export function ProgramDetailsPage({ programId }: ProgramDetailsPageProps) {
  const locale = useLocale();
  const { data: rawProgram, isLoading, isError, error, refetch } = useProgramDetailsQuery(programId);

  const program = rawProgram ? mapProgramToViewModel(rawProgram, locale) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PortalNavbar activePath={routes.faculties} />

      <main className="app-container flex flex-1 flex-col gap-8 py-10">
        {isLoading ? (
          <div className="space-y-8">
            <div className="rounded-[28px] border border-border bg-card p-8 space-y-4">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <section className="flex flex-col gap-6 lg:col-span-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                      <Skeleton className="size-11 rounded-lg" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                      <Skeleton className="h-6 w-28 rounded-md" />
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <Skeleton className="h-7 w-48 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>
              </section>

              <aside className="lg:col-span-4">
                <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                  <Skeleton className="h-7 w-44 rounded-lg" />
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </aside>
            </div>
          </div>
        ) : isError || !program ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center space-y-3 my-auto max-w-lg mx-auto">
            <AlertTriangle className="size-8 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-800">
              {locale === "ar" ? "تعذر التوصل لبيانات البرنامج المطلوب" : "Program details not found"}
            </h3>
            <p className="text-xs text-red-600">
              {(error as Error)?.message || (locale === "ar" ? "البرنامج الأكاديمي غير متوفر حالياً" : "Program details unavailable")}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700"
            >
              {locale === "ar" ? "إعادة المحاولة" : "Retry Connection"}
            </button>
          </div>
        ) : (
          <>
            <ProgramDetailsHero program={program} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <section className="flex flex-col gap-6 lg:col-span-8">
                <ProgramInfoCards program={program} />
                <ProgramContentSections program={program} />
              </section>

              <aside className="lg:col-span-4">
                <ProgramApplyCard program={program} />
              </aside>
            </div>
          </>
        )}
      </main>

      <PortalFooter />
    </div>
  );
}
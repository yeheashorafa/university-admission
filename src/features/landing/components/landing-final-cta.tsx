"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { FileText, FolderKanban, GraduationCap } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";

export function LandingFinalCta() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { isAuthenticated, role } = useCurrentAuth();

  const newAppHref = !isAuthenticated
    ? routes.register
    : role === "student"
    ? routes.newApplication
    : routes.admin;

  const myAppsHref = !isAuthenticated
    ? routes.login
    : role === "student"
    ? routes.applications
    : routes.admin;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12360b] via-[#0f3009] to-[#0a2306] p-8 md:p-14 text-white shadow-xl text-center md:text-start">
      {/* Decorative Blobs */}
      <div className="absolute -start-20 -top-20 size-80 rounded-full bg-[#76BC21]/15 blur-3xl pointer-events-none" />
      <div className="absolute -end-20 -bottom-20 size-80 rounded-full bg-[#0396E9]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-black text-[#76BC21] border border-white/15">
            <GraduationCap className="size-4" />
            <span>{isAr ? "انضم للجامعة الإسلامية بغزة" : "Join IUG Academic Community"}</span>
          </div>

          <h2 className="text-2xl font-black md:text-4xl leading-tight">
            {isAr
              ? "جاهز لبدء مسيرتك الأكاديمية وتقديم طلب القبول؟"
              : "Ready to Begin Your Academic Journey at IUG?"}
          </h2>

          <p className="text-xs md:text-sm text-slate-200/90 leading-relaxed">
            {isAr
              ? "قدم طلبك الإلكتروني الآن وسجل رغباتك الأكاديمية بسهولة، مع إمكانية تقديم أكثر من طلب وتتبع حالة التدقيق والرسوم في أي وقت."
              : "Submit your admission application online today, select your preferences, and track your progress in real time."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <Link
            href={withLocale(locale, newAppHref)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#76BC21] px-6 text-sm font-black text-[#0d2b08] shadow-lg shadow-[#76BC21]/20 hover:bg-[#86cd29] transition active:scale-95 w-full sm:w-auto"
          >
            <FileText className="size-5" />
            <span>{isAr ? "تقديم طلب قبول جديد" : "Submit New Application"}</span>
          </Link>

          <Link
            href={withLocale(locale, myAppsHref)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition active:scale-95 w-full sm:w-auto"
          >
            <FolderKanban className="size-5 text-[#76BC21]" />
            <span>{isAr ? "عرض طلباتي" : "View My Applications"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ClipboardList,
  ArrowUpRight,
  Award,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";

export function LandingSocialResearchSection() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { isAuthenticated, role } = useCurrentAuth();

  const socialResearchHref = !isAuthenticated
    ? routes.login
    : role === "student"
    ? routes.socialResearch
    : routes.admin;

  return (
    <section className="space-y-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#76BC21]/10 px-4 py-1 text-xs font-black text-[#76BC21]">
          <ClipboardList className="size-4" />
          <span>{isAr ? "مرحلة ما بعد القبول الأكاديمي" : "Post-Approval Step Sequence"}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-[#12360b] dark:text-[#8bd63a]">
          {isAr ? "البحث الاجتماعي للمنح" : "Social Research for Scholarships"}
        </h2>

        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {isAr ? "اطّلع على نموذج البحث الاجتماعي للمنح بعد القبول." : "Access scholarship research after admission."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 pt-4">
        <div className="relative flex flex-col justify-between rounded-2xl border border-[#0396E9]/30 bg-[#0396E9]/5 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0396E9] text-white shadow-md">
                <ClipboardList className="size-6" />
              </div>
              <span className="font-mono text-xs font-black text-[#0396E9] bg-[#0396E9]/10 px-3 py-1 rounded-lg border border-[#0396E9]/20">
                {isAr ? "المنح" : "Scholarships"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-foreground">
                {isAr ? "نموذج البحث الاجتماعي للمنح" : "Social Research Form for Financial Aid"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? "تعبئة بيانات الحالة الاجتماعية والاقتصادية للأسرة بعد الحصول على الرقم الجامعي، لتقييم الاستحقاق وحساب نسبة الاعفاء والمنح."
                  : "Submit household socioeconomic information after receiving your student ID to qualify for available scholarships."}
              </p>
            </div>

            <div className="rounded-xl bg-background p-4 border border-border space-y-2">
              <div className="flex items-center justify-between text-2xs font-bold">
                <span className="text-muted-foreground">{isAr ? "النتيجة الفورية للطلب:" : "Instant System Output:"}</span>
                <span className="text-[#0396E9] flex items-center gap-1 font-bold">
                  <Award className="size-3.5 text-[#0396E9]" />
                  {isAr ? "حساب نسبة الخصم والمنحة" : "Scholarship Discount Evaluated"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={withLocale(locale, socialResearchHref)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0396E9] px-4 text-xs font-black text-white shadow-md hover:bg-[#0396E9]/90 transition active:scale-95"
            >
              <span>{isAr ? "تعبئة نموذج البحث الاجتماعي" : "Fill Social Research Form"}</span>
              <ArrowUpRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  CreditCard,
  ClipboardList,
  ArrowUpRight,
  IdCard,
  ArrowRight,
  Award,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";

export function LandingPaymentSocialSection() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { isAuthenticated, role } = useCurrentAuth();

  const paymentHref = !isAuthenticated
    ? routes.login
    : role === "student"
    ? routes.payment
    : routes.admin;

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
          <CreditCard className="size-4" />
          <span>{isAr ? "مرحلة ما بعد القبول الأكاديمي" : "Post-Approval Step Sequence"}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-[#12360b] dark:text-[#8bd63a]">
          {isAr
            ? "سداد الرسوم الإلكترونية يعقبه نموذج البحث الاجتماعي للمنح"
            : "Online Fee Settlement Followed by Social Research for Scholarships"}
        </h2>

        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {isAr
            ? "تأتي مرحلة السداد الإلكتروني فور صدور موافقة القبول وحجز المقعد الأكاديمي، حيث يتم إصدار الرقم الجامعي مباشرة، وتتاح بعدها إمكانية تعبئة استمارة البحث الاجتماعي للاستفادة من منح الجامعة."
            : "Upon admission approval, completing the online fee payment generates your official student ID, enabling access to the social research form for scholarship evaluations."}
        </p>
      </div>

      {/* Dual Connected Sequential Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 pt-4 relative">
        {/* Card 1: Online Fee Payment */}
        <div className="relative flex flex-col justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <CreditCard className="size-6" />
              </div>
              <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                {isAr ? "الخطوة الأولى بعد الموافقة" : "Step 1 Post-Approval"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-foreground">
                {isAr ? "سداد رسوم القبول وتثبيت المقعد" : "Admission Fee Payment & Seat Confirmation"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? "سداد الرسوم المقررة عبر الفيزا، الماستركارد، أو التحويل البنكي وحفظ الإيصال الإلكتروني لتثبيت حجز المقعد في الكلية."
                  : "Pay required admission fees online via credit card or bank transfer to confirm your seat."}
              </p>
            </div>

            <div className="rounded-xl bg-background p-4 border border-border space-y-2">
              <div className="flex items-center justify-between text-2xs font-bold">
                <span className="text-muted-foreground">{isAr ? "النتيجة الفورية للسداد:" : "Instant System Output:"}</span>
                <span className="text-[#76BC21] flex items-center gap-1 font-mono font-bold">
                  <IdCard className="size-3.5 text-[#76BC21]" />
                  {isAr ? "إصدار الرقم الجامعي (2026xxxx)" : "Student ID Generated (2026xxxx)"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={withLocale(locale, paymentHref)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-md hover:bg-emerald-700 transition active:scale-95"
            >
              <span>{isAr ? "الانتقال لبوابة الدفع" : "Go to Payment Portal"}</span>
              <ArrowUpRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>

        {/* Step Connector Indicator for Desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 size-10 items-center justify-center rounded-full bg-[#76BC21] text-[#0d2b08] shadow-lg border-2 border-background">
          <ArrowRight className="size-5 rtl:rotate-180" />
        </div>

        {/* Card 2: Social Research Form */}
        <div className="relative flex flex-col justify-between rounded-2xl border border-[#0396E9]/30 bg-[#0396E9]/5 p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0396E9] text-white shadow-md">
                <ClipboardList className="size-6" />
              </div>
              <span className="font-mono text-xs font-black text-[#0396E9] bg-[#0396E9]/10 px-3 py-1 rounded-lg border border-[#0396E9]/20">
                {isAr ? "الخطوة الثانية للمنح" : "Step 2 Scholarship Research"}
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

"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  FileText,
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  GraduationCap,
  Sparkles,
  Layers,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";

export function LandingApplicationsPreview() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const { isAuthenticated, role } = useCurrentAuth();

  const myAppsHref = !isAuthenticated
    ? routes.login
    : role === "student"
    ? routes.applications
    : routes.admin;

  const sampleApps = [
    {
      id: "app-5",
      appNo: "APP-2026-1005",
      program: isAr ? "الهندسة المدنية" : "Civil Engineering",
      faculty: isAr ? "كلية الهندسة" : "Faculty of Engineering",
      statusLabel: isAr ? "مسودة غير مكتملة" : "Draft Application",
      statusBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      progress: 30,
      nextAction: isAr
        ? "استكمال تعبئة البيانات الشحصية والأكاديمية واختيار الرغبات"
        : "Complete personal, academic details and preference ranking",
      actionText: isAr ? "متابعة تعبئة الطلب" : "Continue Draft",
      actionHref: routes.applications,
      btnClass: "bg-[#76BC21] text-[#0d2b08] hover:bg-[#86cd29]",
      icon: FileText,
    },
    {
      id: "app-3",
      appNo: "APP-2026-1003",
      program: isAr ? "علوم الحاسوب" : "Computer Science",
      faculty: isAr ? "كلية تكنولوجيا المعلومات" : "Faculty of Information Technology",
      statusLabel: isAr ? "بانتظار سداد الرسوم" : "Payment Pending",
      statusBg: "bg-[#0396E9]/10 text-[#0396E9] border-[#0396E9]/30",
      progress: 75,
      nextAction: isAr
        ? "سداد رسوم القبول المقررة لتأكيد الترشيح وإصدار الرقم الجامعي"
        : "Pay admission fee to confirm seat reservation and generate Student ID",
      actionText: isAr ? "سداد الرسوم الآن" : "Pay Fee Now",
      actionHref: routes.payment,
      btnClass: "bg-[#0396E9] text-white hover:bg-[#0396E9]/90",
      icon: CreditCard,
    },
    {
      id: "app-6",
      appNo: "APP-2026-1006",
      program: isAr ? "اللغة الإنجليزية وآدابها" : "English Literature",
      faculty: isAr ? "كلية الآداب" : "Faculty of Arts",
      statusLabel: isAr ? "مكتمل - رقم جامعي: 202610012" : "Completed - ID: 202610012",
      statusBg: "bg-[#76BC21]/15 text-[#76BC21] border-[#76BC21]/30",
      progress: 100,
      nextAction: isAr
        ? "ملف القبول مكتمل ورسمي، يمكنك تعبئة نموذج البحث الاجتماعي للمنح"
        : "Admission active and verified. Proceed to social research for scholarships",
      actionText: isAr ? "عرض بطاقة الملف" : "View Final File",
      actionHref: routes.socialResearch,
      btnClass: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700",
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="space-y-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#76BC21]">
            <Layers className="size-4" />
            <span>{isAr ? "منظومة الطلبات المتعددة" : "Multi-Application Architecture"}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#12360b] dark:text-[#8bd63a] md:text-3xl">
            {isAr
              ? "يمكنك تقديم أكثر من طلب قبول ومتابعة كل طلب بشكل مستقل"
              : "Submit & Manage Multiple Admission Applications Independently"}
          </h2>
          <p className="max-w-2xl text-xs md:text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "تسمح البوابة للطالب بتقديم رغبات متعددة في كليات مختلفة (مثل الحاسوب والهندسة والآداب). يمكنك تتبع كل طلب على حدة، ومتابعة نسبة التدقيق بالذكاء الاصطناعي، وسداد الرسوم بشكل مستقل."
              : "Our university gateway lets you file distinct applications across different faculties and track status, AI document verification, payment, and social research for each file separately."}
          </p>
        </div>

        <div>
          <Link
            href={withLocale(locale, myAppsHref)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#76BC21] px-5 text-xs font-black text-[#0d2b08] shadow transition hover:bg-[#86cd29] active:scale-95"
          >
            <span>{isAr ? "الانتقال لمركز طلباتي" : "Go to My Applications"}</span>
            <ArrowUpRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* 3 Realistic Application Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {sampleApps.map((app) => {
          const Icon = app.icon;

          return (
            <div
              key={app.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-2xs hover:border-[#76BC21]/40 hover:shadow-md transition duration-200"
            >
              <div className="space-y-4">
                {/* App Header & Status Pill */}
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="font-mono text-xs font-black text-[#76BC21] bg-[#76BC21]/10 px-2.5 py-1 rounded-lg">
                    {app.appNo}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${app.statusBg}`}
                  >
                    <Icon className="size-3" />
                    {app.statusLabel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-2xs font-bold text-muted-foreground">
                    <span>{isAr ? "مستوى التقدم" : "Progress"}</span>
                    <span>{app.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-[#76BC21] transition-all duration-500"
                      style={{ width: `${app.progress}%` }}
                    />
                  </div>
                </div>

                {/* Program & Faculty */}
                <div className="space-y-1 pt-1">
                  <span className="text-2xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <GraduationCap className="size-3.5 text-[#76BC21]" />
                    {isAr ? "التخصص والكلية" : "Program & Faculty"}
                  </span>
                  <h3 className="text-base font-extrabold text-foreground">
                    {app.program}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground">
                    {app.faculty}
                  </p>
                </div>

                {/* Next Action Prompt */}
                <div className="rounded-xl bg-muted/60 p-3.5 border border-border/60 space-y-1">
                  <p className="text-2xs font-bold text-[#0396E9] flex items-center gap-1">
                    <Sparkles className="size-3" />
                    {isAr ? "الإجراء المطلوب حالياً:" : "Required Next Action:"}
                  </p>
                  <p className="text-xs font-bold text-foreground leading-snug">
                    {app.nextAction}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <Link
                  href={withLocale(locale, app.actionHref)}
                  className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-black shadow-xs transition active:scale-95 ${app.btnClass}`}
                >
                  <span>{app.actionText}</span>
                  <ArrowUpRight className="size-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

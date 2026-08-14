"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Building2,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";

export function LandingFacultiesPreview() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const faculties = [
    {
      name: isAr ? "كلية تكنولوجيا المعلومات" : "Faculty of Information Technology",
      count: isAr ? "5 تخصصات نوعية" : "5 Specialized Programs",
      minAvg: isAr ? "أدنى معدل: 75%" : "Min Avg: 75%",
      icon: Sparkles,
      desc: isAr
        ? "هندسة البرمجيات، علوم الحاسوب، تكنولوجيا الوسائط، وعلم البيانات والذكاء الاصطناعي."
        : "Software Engineering, CS, Multimedia Tech, and AI & Data Science.",
      colorBadge: "bg-[#76BC21]/15 text-[#76BC21] border-[#76BC21]/30",
    },
    {
      name: isAr ? "كلية الهندسة" : "Faculty of Engineering",
      count: isAr ? "8 تخصصات هندسية" : "8 Engineering Programs",
      minAvg: isAr ? "أدنى معدل: 80%" : "Min Avg: 80%",
      icon: Building2,
      desc: isAr
        ? "الهندسة المدنية، المعمارية، هندسة الحاسوب، الكهربائية، والأنظمة المضمنة."
        : "Civil, Architectural, Computer, Electrical, and Embedded Systems Engineering.",
      colorBadge: "bg-[#0396E9]/10 text-[#0396E9] border-[#0396E9]/30",
    },
    {
      name: isAr ? "كلية الطب البشري" : "Faculty of Medicine",
      count: isAr ? "برنامج الطب والجراحة" : "Medicine & Surgery Program",
      minAvg: isAr ? "أدنى معدل: 90%" : "Min Avg: 90%",
      icon: Award,
      desc: isAr
        ? "برنامج الطب والجراحة البشري المميز مع المختبرات والمستشفيات التعليمية السريرية."
        : "Bachelor of Medicine & Surgery with clinical labs and teaching hospital rotations.",
      colorBadge: "bg-[#76BC21]/15 text-[#76BC21] border-[#76BC21]/30",
    },
    {
      name: isAr ? "كلية العلوم الصحية" : "Faculty of Health Sciences",
      count: isAr ? "6 تخصصات طبية مساندة" : "6 Allied Health Programs",
      minAvg: isAr ? "أدنى معدل: 75%" : "Min Avg: 75%",
      icon: GraduationCap,
      desc: isAr
        ? "العلوم الطبية المخبرية، التمريض، البصريات، والعلاج الطبيعي."
        : "Medical Laboratory Sciences, Nursing, Optometry, and Physical Therapy.",
      colorBadge: "bg-[#0396E9]/10 text-[#0396E9] border-[#0396E9]/30",
    },
  ];

  return (
    <section className="space-y-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#76BC21]">
            <Building2 className="size-4" />
            <span>{isAr ? "الهيكلية الأكاديمية للقبول" : "Academic Faculties First Model"}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#12360b] dark:text-[#8bd63a] md:text-3xl">
            {isAr
              ? "اختر الكلية أولاً ← ثم استكشف التخصصات والبرامج المتاحة"
              : "Select Faculty First → Discover Programs & Specializations"}
          </h2>
          <p className="max-w-2xl text-xs md:text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "تعتمد البوابة منهجية التصفح حسب الكلية الأكاديمية أولاً، لمراجعة الشروط والمعدلات الدنيا والفروع المطلوبة (علمي/أدبي) قبل اختيار وتثبيت رغباتك."
              : "Navigate through academic faculties first, check minimum high school averages and branch requirements, then submit your choices."}
          </p>
        </div>

        <div>
          <Link
            href={withLocale(locale, routes.programs)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#76BC21]/40 bg-[#76BC21]/10 px-5 text-xs font-extrabold text-[#76BC21] hover:bg-[#76BC21]/20 transition"
          >
            <BookOpen className="size-4" />
            <span>{isAr ? "دليل كافة الكليات والبرامج" : "View All Faculties & Programs"}</span>
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* 4 Major Faculties Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {faculties.map((fac, idx) => {
          const Icon = fac.icon;

          return (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-2xs hover:border-[#76BC21]/40 hover:shadow-md transition duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#76BC21]/10 text-[#76BC21] group-hover:scale-110 transition duration-300">
                    <Icon className="size-6" />
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${fac.colorBadge}`}
                  >
                    {fac.minAvg}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-foreground leading-tight">
                    {fac.name}
                  </h3>
                  <p className="mt-1 text-2xs font-bold text-[#76BC21]">
                    {fac.count}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {fac.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-2xs font-bold text-muted-foreground">
                  {isAr ? "درجة البكالوريوس" : "Bachelor Degree"}
                </span>

                <Link
                  href={withLocale(locale, routes.programs)}
                  className="text-xs font-bold text-[#76BC21] hover:underline flex items-center gap-1"
                >
                  <span>{isAr ? "استعراض" : "Explore"}</span>
                  <ChevronRight className="size-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

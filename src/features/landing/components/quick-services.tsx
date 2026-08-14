"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import {
  FileText,
  Search,
  CreditCard,
  ClipboardList,
  ArrowUpRight,
  FolderKanban,
  FileCheck2,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { useCurrentAuth } from "@/hooks/use-current-auth";

export function QuickServices() {
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

  const docsHref = !isAuthenticated
    ? routes.login
    : role === "student"
    ? routes.documents
    : routes.admin;

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

  const statusHref = !isAuthenticated
    ? routes.login
    : role === "student"
    ? routes.status
    : routes.admin;

  const services = [
    {
      title: isAr ? "تقديم طلب جديد" : "Submit New Application",
      description: isAr
        ? "ابدأ مسيرتك الجامعية وقدم طلب قبول جديد في الكلية والتخصص الذي ترغب به."
        : "Begin your academic journey and submit a new admission application easily.",
      icon: FileText,
      href: newAppHref,
      actionText: isAr ? "تقديم طلب" : "Apply Now",
      badgeText: isAr ? "خدمة رئيسية" : "Core Service",
      badgeColor: "bg-[#76BC21]/15 text-[#76BC21] border-[#76BC21]/30",
    },
    {
      title: isAr ? "طلباتي وإدارة الملفات" : "My Applications & Files",
      description: isAr
        ? "استعرض كافة طلبات القبول المقدمة، تابع حالتها، وأكمل خطوات كل طلب بشكل مستقل."
        : "Manage and track all your submitted admission applications independently.",
      icon: FolderKanban,
      href: myAppsHref,
      actionText: isAr ? "عرض طلباتي" : "My Applications",
      badgeText: isAr ? "طلبات متعددة" : "Multi Apps",
      badgeColor: "bg-[#76BC21]/15 text-[#76BC21] border-[#76BC21]/30",
    },
    {
      title: isAr ? "تتبع حالة الطلب" : "Track Application Status",
      description: isAr
        ? "تابع تقدم طلب القبول ونتائج التدقيق بالذكاء الاصطناعي والمراجعة الأكاديمية."
        : "Monitor your application progress and AI document verification in real-time.",
      icon: Search,
      href: statusHref,
      actionText: isAr ? "متابعة الحالة" : "Track Status",
      badgeText: isAr ? "تحديث فورائي" : "Real-time",
      badgeColor: "bg-[#0396E9]/10 text-[#0396E9] border-[#0396E9]/30",
    },
    {
      title: isAr ? "رفع وتوثيق المستندات" : "Upload & Verify Documents",
      description: isAr
        ? "ارفاق كشوف درجات الثانوية العامة والوثائق الثبوتية للتحقق الذكي بالذكاء الاصطناعي."
        : "Upload transcripts and official ID scans for automated AI verification.",
      icon: FileCheck2,
      href: docsHref,
      actionText: isAr ? "مركز المستندات" : "Document Center",
      badgeText: isAr ? "تدقيق ذكي" : "AI Verification",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
    {
      title: isAr ? "سداد رسوم القبول" : "Pay Admission Fees",
      description: isAr
        ? "سدد الرسوم المقررة إلكترونياً بعد موافقة القبول لتأكيد الترشيح وإصدار الرقم الجامعي."
        : "Pay required admission fees online to confirm your seat and generate Student ID.",
      icon: CreditCard,
      href: paymentHref,
      actionText: isAr ? "بوابة الدفع" : "Payment Portal",
      badgeText: isAr ? "دفع إلكتروني" : "E-Payment",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      title: isAr ? "نموذج البحث الاجتماعي" : "Social Research Form",
      description: isAr
        ? "أكمل نموذج البحث الاجتماعي بعد الحصول على الرقم الجامعي لطلب المنح والمساعدات."
        : "Fill the social research form after obtaining Student ID for scholarship evaluation.",
      icon: ClipboardList,
      href: socialResearchHref,
      actionText: isAr ? "تعبئة النموذج" : "Fill Form",
      badgeText: isAr ? "دعم المنح" : "Scholarships",
      badgeColor: "bg-[#0396E9]/10 text-[#0396E9] border-[#0396E9]/30",
    },
  ];

  return (
    <section className="space-y-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-black text-[#76BC21]">
            <FolderKanban className="size-4" />
            <span>{isAr ? "بوابة الخدمات الطلابية" : "Student Services Portal Gateway"}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#12360b] dark:text-[#8bd63a] md:text-3xl">
            {isAr
              ? "الوصول السريع لجميع خدمات القبول والتسجيل"
              : "Quick Access to All Admission Services"}
          </h2>
          <p className="max-w-2xl text-xs md:text-sm text-muted-foreground leading-relaxed">
            {isAr
              ? "منظومة إلكترونية متكاملة تتيح لك إنجاز كافة إجراءات قبولك في الجامعة الإسلامية بسهولة وشفافية."
              : "An integrated digital suite allowing you to execute all your admission procedures efficiently."}
          </p>
        </div>
      </div>

      {/* Services 6 Grid Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, idx) => {
          const Icon = service.icon;

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
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${service.badgeColor}`}
                  >
                    {service.badgeText}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-foreground leading-tight">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60">
                <Link
                  href={withLocale(locale, service.href)}
                  className="inline-flex items-center gap-1 text-xs font-black text-[#76BC21] hover:underline"
                >
                  <span>{service.actionText}</span>
                  <ArrowUpRight className="size-4 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

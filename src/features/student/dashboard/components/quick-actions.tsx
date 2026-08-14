"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { PlusCircle, FileText, FileUp } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";

export function QuickActions() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const actions = [
    {
      title: isAr ? "تقديم طلب جديد" : "Submit New Application",
      description: isAr ? "بدء طلب قبول جامعي جديد" : "Start a new admission application",
      href: routes.newApplication,
      icon: PlusCircle,
      className: "bg-primary/10 text-primary",
    },
    {
      title: isAr ? "طلباتي" : "My Applications",
      description: isAr ? "عرض وتتبع كافة طلباتك" : "View and track all your applications",
      href: routes.applications,
      icon: FileText,
      className: "bg-secondary/15 text-secondary",
    },
    {
      title: isAr ? "رفع المستندات" : "Upload Documents",
      description: isAr ? "رفع وثائق الهوية والشهادات" : "Upload identity & certificates",
      href: routes.documents,
      icon: FileUp,
      className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {actions.map((action, idx) => {
        const Icon = action.icon;

        return (
          <Link
            key={idx}
            href={withLocale(locale, action.href)}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="space-y-3">
              <div
                className={`flex size-12 items-center justify-center rounded-xl transition group-hover:scale-110 ${action.className}`}
              >
                <Icon className="size-6" />
              </div>

              <h3 className="text-base font-bold text-foreground leading-tight">
                {action.title}
              </h3>

              <p className="text-xs text-muted-foreground leading-5">
                {action.description}
              </p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
"use client";

import { useLocale, useTranslations } from "next-intl";
import { GitCommitHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentApplicationsQuery } from "@/hooks/queries/use-application-queries";
import { BACKEND_STATUS_MAP } from "@/lib/adapters/status-adapter";

export function AdmissionTimeline() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data: applications } = useStudentApplicationsQuery();
  const activeApp = applications?.[0];
  const currentStatus = activeApp?.status || "draft";
  const stepIndex = BACKEND_STATUS_MAP[currentStatus]?.stepIndex ?? 0;

  const timelineSteps = [
    { title: isAr ? "تقديم طلب الالتحاق" : "Application Submission", status: stepIndex >= 1 ? "completed" : stepIndex === 0 ? "active" : "pending" },
    { title: isAr ? "مراجعة وتدقيق المستندات" : "Document Verification", status: stepIndex >= 2 ? "completed" : stepIndex === 1 ? "active" : "pending" },
    { title: isAr ? "قرار القبول والاعتماد الأكاديمي" : "Admission Decision", status: stepIndex >= 3 ? "completed" : stepIndex === 2 ? "active" : "pending" },
    { title: isAr ? "إصدار الرقم الجامعي واستكمال القيد" : "Student Registration", status: currentStatus === "accepted" ? "completed" : "pending" },
  ];

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-6 flex items-center gap-2 border-b border-border pb-3 text-xl font-bold text-primary">
        <GitCommitHorizontal className="size-6 text-secondary" />
        {t("admissionJourney")}
      </h2>

      <div className="relative ms-3 space-y-7 border-s-2 border-border ps-6">
        {timelineSteps.map((item) => (
          <div key={item.title} className="relative">
            <span
              className={cn(
                "absolute -start-[33px] top-1 size-4 rounded-full border-2 border-card",
                item.status === "completed" && "bg-primary",
                item.status === "active" && "bg-secondary animate-pulse",
                item.status === "pending" && "bg-border"
              )}
            />

            <p
              className={cn(
                "font-bold text-sm",
                item.status === "completed" && "text-primary",
                item.status === "active" && "text-secondary",
                item.status === "pending" && "text-muted-foreground"
              )}
            >
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
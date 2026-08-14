"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  XCircle,
} from "lucide-react";
import { routes, withLocale } from "@/constants/routes";
import { isRejectedStatus } from "../utils/student-status-workflow";
import { ActionCard } from "./action-card";

type StudentRequiredActionProps = {
  application: {
    currentStatus?: string;
    status?: string;
    rejectionNote?: string;
  };
  locale: string;
};

export function StudentRequiredAction({
  application,
  locale,
}: StudentRequiredActionProps) {
  const t = useTranslations("studentStatusWorkflow");
  const currentStatus = application.status || application.currentStatus || "submitted";
  const isAr = locale === "ar";

  if (isRejectedStatus(currentStatus)) {
    return (
      <ActionCard
        icon={XCircle}
        title={t("rejectedTitle")}
        description={application.rejectionNote ?? t("rejectedDescription")}
        variant="danger"
      />
    );
  }

  if (currentStatus === "returned_for_revision") {
    return (
      <section className="rounded-[28px] border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
        <div className="mb-4 flex size-12 items-center justify-center rounded-[18px] bg-amber-100 text-amber-700">
          <FileWarning className="size-6" />
        </div>

        <h2 className="text-xl font-bold text-amber-900">
          {isAr ? "إعادة الطلب للمراجعة وتعديل البيانات" : "Application Returned for Revision"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          {isAr
            ? "تمت إعادة الطلب من قسم القبول. يرجى مراجعة الملاحظات وتعديل البيانات أو إرفاق المستندات المطلوبة."
            : "Your application was returned by the admission office. Please review feedback and update details or attachments."}
        </p>

        <Link
          href={withLocale(locale, routes.newApplication)}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[16px] bg-amber-600 text-sm font-bold text-white transition hover:bg-amber-700"
        >
          {isAr ? "تعديل بيانات الطلب" : "Edit Application Details"}
        </Link>
      </section>
    );
  }

  if (currentStatus === "accepted") {
    return (
      <section className="rounded-[28px] border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
        <div className="mb-4 flex size-12 items-center justify-center rounded-[18px] bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-6" />
        </div>

        <h2 className="text-xl font-bold text-emerald-900">
          {isAr ? "تهانينا! تم قبول طلبك بنجاح" : "Congratulations! Application Accepted"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-emerald-800">
          {isAr
            ? "تمت الموافقة النهائية على طلب الالتحاق بالجامعة. يرجى متابعة التعليمات لاستكمال المستندات واستلام الرقم الجامعي."
            : "Your admission application has been officially accepted. Please complete profile and documents."}
        </p>

        <Link
          href={withLocale(locale, routes.documents)}
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[16px] bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          {isAr ? "متابعة المستندات والملف" : "Manage Documents & Profile"}
        </Link>
      </section>
    );
  }

  return (
    <ActionCard
      icon={AlertTriangle}
      title={t("noActionTitle")}
      description={t("noActionDescription")}
      variant="info"
    />
  );
}
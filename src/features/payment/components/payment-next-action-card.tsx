"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, GraduationCap, RefreshCcw } from "lucide-react";
import { routes, withLocale } from "@/constants/routes";

type PaymentNextActionCardProps = {
  locale: string;
  variant: "success" | "failed";
};

export function PaymentNextActionCard({
  locale,
  variant,
}: PaymentNextActionCardProps) {
  const t = useTranslations("payment");

  const isSuccess = variant === "success";

  return (
    <section className=" rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div className="mb-4 flex size-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
        {isSuccess ? (
          <GraduationCap className="size-6" />
        ) : (
          <RefreshCcw className="size-6" />
        )}
      </div>

      <h2 className="text-xl font-bold text-primary">
        {isSuccess ? t("successNextTitle") : t("failedNextTitle")}
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {isSuccess ? t("successNextDescription") : t("failedNextDescription")}
      </p>

      <Link
        href={withLocale(
          locale,
          isSuccess ? routes.socialResearch : routes.payment
        )}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[16px] bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        {isSuccess ? t("completeSocialResearch") : t("tryPaymentAgain")}
        <ArrowRight className="size-4 rtl:rotate-180" />
      </Link>
    </section>
  );
}
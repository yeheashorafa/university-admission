"use client";

import { useTranslations } from "next-intl";
import { PaymentResultHero } from "../components/payment-result-hero";
import { PortalNavbar } from "@/components/layouts/portal-navbar";
import { routes } from "@/constants/routes";
import { PortalFooter } from "@/components/layouts/portal-footer";
import { AlertTriangle } from "lucide-react";

export function PaymentFailedPage() {
  const t = useTranslations("payment");



  return (
    <main className="min-h-screen bg-background text-foreground">
      <PortalNavbar activePath={routes.payment} />
      <div className="app-container space-y-6 py-8 md:py-12">
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>PENDING_BACKEND_API:</strong> بيانات سجل سير الطلب مصدرها بيانات مؤقتة حتى
            يوفر الخادم نقطة النهاية{" "}
            <code className="font-mono text-xs">GET /api/payment/result/:id</code>
          </span>
        </div>
        <PaymentResultHero
          variant="failed"
          badge={t("failedBadge")}
          title={t("failedTitle")}
          description={t("failedDescription")}
        />

      </div>
      <PortalFooter />
    </main>
  );
}
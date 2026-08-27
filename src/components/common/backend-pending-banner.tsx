import { AlertTriangle, type LucideIcon } from "lucide-react";
import { useLocale } from "next-intl";

type BackendPendingBannerProps = {
  title?: string;
  description?: string;
  icon?: LucideIcon;
};

export function BackendPendingBanner({
  title,
  description,
  icon: Icon = AlertTriangle,
}: BackendPendingBannerProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>
        <strong>PENDING_BACKEND_API:</strong>{" "}
        {description ??
          (isAr
            ? "هذه الميزة بانتظار توفير نقاط النهاية (Endpoints) من الخادم. العمليات معطلة حالياً."
            : "This feature is pending backend endpoints. Actions are disabled until the API is available.")}
      </span>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  ClipboardList,
  FileWarning,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminKpiCard as AdminKpiCardType } from "../data/admin-dashboard.data";

type AdminKpiCardProps = {
  card: AdminKpiCardType;
};

const kpiIconMap: Record<AdminKpiCardType["id"], LucideIcon> = {
  total: FolderOpen,
  review: ClipboardList,
  missing: FileWarning,
  "ai-alerts": AlertTriangle,
  accepted: CheckCircle2,
  rejected: CircleX,
};

const variantClasses = {
  default: {
    icon: "text-secondary bg-secondary/10",
    label: "text-muted-foreground",
    value: "text-primary",
    card: "bg-card",
  },
  warning: {
    icon: "text-accent-foreground bg-accent/40",
    label: "text-muted-foreground",
    value: "text-primary",
    card: "bg-card",
  },
  success: {
    icon: "text-primary bg-primary/10",
    label: "text-muted-foreground",
    value: "text-primary",
    card: "bg-card",
  },
  danger: {
    icon: "text-destructive bg-destructive/10",
    label: "text-destructive",
    value: "text-destructive",
    card: "bg-destructive/5",
  },
};

export function AdminKpiCard({ card }: AdminKpiCardProps) {
  const t = useTranslations("admin");

  const Icon = kpiIconMap[card.id];
  const variant = variantClasses[card.variant ?? "default"];

  return (
    <article
      className={cn(
        "min-h-[170px] rounded-xl border border-border p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)] transition hover:shadow-[0px_4px_20px_rgba(0,77,64,0.08)]",
        variant.card
      )}
    >
      <div
        className={cn(
          "mb-8 flex size-11 items-center justify-center rounded-lg",
          variant.icon
        )}
      >
        <Icon className="size-6" />
      </div>

      <p className={cn("mb-2 text-sm font-medium", variant.label)}>
        {t(`kpi.${card.id}`)}
      </p>

      <p className={cn("text-3xl font-bold", variant.value)}>
        {card.value}
      </p>
    </article>
  );
}
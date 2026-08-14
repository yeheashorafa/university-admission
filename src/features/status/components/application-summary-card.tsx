import type { LucideIcon } from "lucide-react";

type ApplicationSummaryCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function ApplicationSummaryCard({ icon: Icon, label, value }: ApplicationSummaryCardProps) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0px_12px_35px_rgba(118,188,33,0.06)]">
      <div className="mb-4 flex size-11 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>

      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-bold text-foreground">{value}</p>
    </div>
  );
}
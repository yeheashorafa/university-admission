import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ActionCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  variant: "info" | "success" | "danger";
};

export function ActionCard({
  icon: Icon,
  title,
  description,
  variant,
}: ActionCardProps) {
  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0px_12px_35px_rgba(118,188,33,0.07)]">
      <div
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-[18px]",
          variant === "info" && "bg-primary/10 text-primary",
          variant === "success" && "bg-secondary/10 text-secondary",
          variant === "danger" && "bg-destructive/10 text-destructive"
        )}
      >
        <Icon className="size-6" />
      </div>

      <h2 className="text-xl font-bold text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
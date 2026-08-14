"use client";

import { CheckCircle2 } from "lucide-react";
import { adminFunctionalChecklist } from "@/constants/admin-functional-checklist";

export function AdminFunctionalChecklistCard() {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary">
          Admin Functional Checklist
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This checklist summarizes the implemented admin dashboard functionality.
        </p>
      </div>

      <div className="space-y-4">
        {adminFunctionalChecklist.map((item) => (
          <article
            key={item.path}
            className="rounded-lg border border-border bg-muted p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-foreground">{item.page}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.path}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <CheckCircle2 className="size-4" />
                Completed
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {item.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

type LegalPoliciesHeaderProps = {
  onCreatePolicy: () => void;
};

export function LegalPoliciesHeader({
  onCreatePolicy,
}: LegalPoliciesHeaderProps) {
  const t = useTranslations("admin");

  return (
    <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          {t("legalPolicies.complianceCenter")}
        </p>

        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          {t("legalPolicies.title")}
        </h1>

        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          {t("legalPolicies.description")}
        </p>
      </div>

      <button
        type="button"
        onClick={onCreatePolicy}
        className="inline-flex h-12 w-max items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
      >
        <Plus className="size-5" />
        {t("legalPolicies.newPolicy")}
      </button>
    </header>
  );
}
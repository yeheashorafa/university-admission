"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  LegalPolicy,
  LegalPolicyStatus,
} from "../data/legal-policies.data";

type LegalPoliciesListProps = {
  policies: LegalPolicy[];
  activePolicyId: string;
  onSelectPolicy: (policyId: string) => void;
};

const statusConfig: Record<
  LegalPolicyStatus,
  {
    labelKey: string;
    className: string;
  }
> = {
  published: {
    labelKey: "legalPolicies.statuses.published",
    className: "bg-primary/10 text-primary",
  },
  draft: {
    labelKey: "legalPolicies.statuses.draft",
    className: "bg-accent/40 text-accent-foreground",
  },
  archived: {
    labelKey: "legalPolicies.statuses.archived",
    className: "bg-muted text-muted-foreground",
  },
};

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْ]/g, "");
}

export function LegalPoliciesList({
  policies,
  activePolicyId,
  onSelectPolicy,
}: LegalPoliciesListProps) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");

  const filteredPolicies = useMemo(() => {
    const searchValue = normalizeSearchText(search);

    if (!searchValue) return policies;

    return policies.filter((policy) => {
      const searchableText = normalizeSearchText(
        [
          policy.title,
          policy.description,
          policy.content,
          policy.status,
          policy.version,
          policy.updatedBy,
          policy.lastUpdated,
        ].join(" ")
      );

      return searchableText.includes(searchValue);
    });
  }, [policies, search]);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-primary">
          {t("legalPolicies.policyLibrary")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("legalPolicies.policyLibraryDescription")}
        </p>
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("legalPolicies.searchPlaceholder")}
          className="h-11 w-full rounded-lg border border-input bg-card px-4 ps-10 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredPolicies.length > 0 ? (
          filteredPolicies.map((policy) => {
            const status = statusConfig[policy.status];
            const isActive = policy.id === activePolicyId;

            return (
              <button
                key={policy.id}
                type="button"
                onClick={() => onSelectPolicy(policy.id)}
                className={cn(
                  "relative w-full overflow-hidden rounded-lg border p-4 text-start transition hover:bg-muted",
                  isActive
                    ? "border-secondary bg-secondary/10"
                    : "border-border bg-card"
                )}
              >
                {isActive && (
                  <div className="absolute inset-y-0 start-0 w-1 bg-primary" />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground">{policy.title}</p>

                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {policy.description}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-1 text-xs font-bold",
                      status.className
                    )}
                  >
                    {t(status.labelKey)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{policy.version}</span>
                  <span>{policy.lastUpdated}</span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            {t("legalPolicies.noResultsDescription")}
          </div>
        )}
      </div>
    </section>
  );
}
"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { AiProvider, AiProviderList } from "@/services/admin-ai-providers.service";

export function AiProvidersTable({ data, onEdit, renderActions }: {
  data: AiProviderList;
  onEdit: (provider: AiProvider) => void;
  renderActions?: (provider: AiProvider, active: boolean) => ReactNode;
}) {
  const t = useTranslations("adminAiProviders");
  const format = useFormatter();
  const activeProvider = data.providers.find((provider) => provider.id === data.active_provider_id);
  const columns = ["label", "provider", "model", "timeout", "enabled", "credentials", "lastTest", "actions"] as const;

  return (
    <div className="space-y-4">
      {data.active_provider_id === null && (
        <p role="status" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm font-semibold">{t("noActive")}</p>
      )}
      {activeProvider?.last_test_status === "failed" && (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm font-semibold">
          {t("activeFailure", { label: activeProvider.label })} {t(`codes.${activeProvider.last_test_code ?? "unexpected"}`)}
        </p>
      )}
      {data.providers.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table aria-label={t("title")} className="w-full text-start text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>{columns.map((column) => <th key={column} scope="col" className="whitespace-nowrap px-4 py-3 text-start font-semibold">{t(column)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.providers.map((provider) => {
                const active = provider.id === data.active_provider_id;
                return (
                  <tr key={provider.id}>
                    <th scope="row" className="px-4 py-4 text-start font-semibold">
                      {provider.label}
                      {active && <span className="ms-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{t("active")}</span>}
                    </th>
                    <td className="px-4 py-4">{t(`types.${provider.provider}`)}</td>
                    <td className="px-4 py-4"><bdi>{provider.model ?? "—"}</bdi></td>
                    <td className="whitespace-nowrap px-4 py-4">{t("seconds", { count: provider.timeout_seconds })}</td>
                    <td className="px-4 py-4">{t(provider.is_enabled ? "on" : "off")}</td>
                    <td className="px-4 py-4">{t(provider.has_credentials ? "keyConfigured" : "noKey")}</td>
                    <td className="min-w-36 px-4 py-4">
                      <p>{t(`status.${provider.last_test_status ?? "untested"}`)}</p>
                      {provider.tested_at && (
                        <time dateTime={provider.tested_at} className="block text-xs text-muted-foreground">
                          {format.dateTime(new Date(provider.tested_at), { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })}
                        </time>
                      )}
                    </td>
                    <td className="min-w-36 px-4 py-4">
                      <button type="button" onClick={() => onEdit(provider)} className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-muted">{t("edit")}</button>
                      {renderActions?.(provider, active)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

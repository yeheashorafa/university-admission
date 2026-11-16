"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { routes } from "@/constants/routes";
import { useAdminAiProvidersQuery, useCreateAiProviderMutation, useUpdateAiProviderMutation } from "@/hooks/queries/use-admin-ai-providers-queries";
import type { AiProvider } from "@/services/admin-ai-providers.service";
import { AiProviderForm } from "./form";
import { AiProvidersTable } from "./table";

export function AiProvidersPage() {
  const t = useTranslations("adminAiProviders");
  const query = useAdminAiProvidersQuery();
  const create = useCreateAiProviderMutation();
  const update = useUpdateAiProviderMutation();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const provider = query.data?.providers.find((item) => item.id === editing);
  const busy = create.isPending || update.isPending;

  function startEdit(item: AiProvider) {
    if (!busy) setEditing(item.id);
  }

  return (
    <AdminLayout activePath={routes.adminAiProviders}>
      <div className="space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <button type="button" disabled={busy} onClick={() => setEditing("new")} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {t("createTitle")}
          </button>
        </header>

        {(editing === "new" || provider) && (
          <AiProviderForm
            key={editing}
            provider={provider}
            active={provider !== undefined && provider.id === query.data?.active_provider_id}
            pending={busy}
            labels={query.data?.providers.filter((item) => item.id !== editing).map((item) => item.label) ?? []}
            onCancel={() => setEditing(null)}
            onSave={async (payload) => {
              if (provider) await update.save(provider.id, payload);
              else await create.save(payload);
              setEditing(null);
            }}
          />
        )}

        {query.isPending && <p role="status" className="text-sm text-muted-foreground">{t("loading")}</p>}
        {query.isError && (
          <div role="alert" className="space-y-2 text-sm">
            <p>{t("loadError")}</p>
            <button type="button" disabled={query.isFetching} onClick={() => void query.refetch()} className="rounded-lg border border-border px-3 py-2">{t("retry")}</button>
          </div>
        )}
        {query.data && <AiProvidersTable data={query.data} onEdit={startEdit} />}
      </div>
    </AdminLayout>
  );
}

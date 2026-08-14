"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  Eye,
  History,
  Save,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  LegalPolicy,
  LegalPolicyStatus,
} from "../data/legal-policies.data";

type LegalPolicyEditorProps = {
  policy: LegalPolicy;
  onUpdatePolicy: (
    policyId: string,
    updates: Partial<LegalPolicy>,
    successMessage: string
  ) => void;
  onChangeStatus: (policyId: string, status: LegalPolicyStatus) => void;
  onDeletePolicy: (policyId: string) => void;
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

export function LegalPolicyEditor({
  policy,
  onUpdatePolicy,
  onChangeStatus,
  onDeletePolicy,
}: LegalPolicyEditorProps) {
  return (
    <LegalPolicyEditorContent
      key={policy.id}
      policy={policy}
      onUpdatePolicy={onUpdatePolicy}
      onChangeStatus={onChangeStatus}
      onDeletePolicy={onDeletePolicy}
    />
  );
}

function LegalPolicyEditorContent({
  policy,
  onUpdatePolicy,
  onChangeStatus,
  onDeletePolicy,
}: LegalPolicyEditorProps) {
  const t = useTranslations("admin");

  const [title, setTitle] = useState(policy.title);
  const [description, setDescription] = useState(policy.description);
  const [content, setContent] = useState(policy.content);

  const status = statusConfig[policy.status];

  function handleSaveDraft() {
    onUpdatePolicy(
      policy.id,
      {
        title,
        description,
        content,
        status: "draft",
      },
      t("legalPolicies.savedDraftSuccessfully")
    );
  }

  function handlePublish() {
    onUpdatePolicy(
      policy.id,
      {
        title,
        description,
        content,
        status: "published",
      },
      t("legalPolicies.publishedSuccessfully")
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <div className="border-b border-border p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  status.className
                )}
              >
                {t(status.labelKey)}
              </span>

              <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                {policy.version}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-primary">
              {t("legalPolicies.policyEditor")}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {t("legalPolicies.lastUpdatedBy", {
                name: policy.updatedBy,
                date: policy.lastUpdated,
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <EditorActionButton icon={Eye} label={t("legalPolicies.preview")} />

            <EditorActionButton
              icon={History}
              label={t("legalPolicies.history")}
            />

            <EditorActionButton
              icon={Archive}
              label={t("legalPolicies.archive")}
              onClick={() => onChangeStatus(policy.id, "archived")}
            />

            <EditorActionButton
              icon={Trash2}
              label={t("legalPolicies.delete")}
              onClick={() => onDeletePolicy(policy.id)}
              className="text-destructive hover:bg-destructive/10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <label
            htmlFor="policy-title"
            className="text-sm font-medium text-muted-foreground"
          >
            {t("legalPolicies.policyTitle")}
          </label>

          <input
            id="policy-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="policy-description"
            className="text-sm font-medium text-muted-foreground"
          >
            {t("legalPolicies.shortDescription")}
          </label>

          <textarea
            id="policy-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[90px] w-full rounded-lg border border-input bg-card p-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="policy-content"
            className="text-sm font-medium text-muted-foreground"
          >
            {t("legalPolicies.policyContent")}
          </label>

          <textarea
            id="policy-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-[260px] w-full rounded-lg border border-input bg-card p-4 text-base leading-7 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="rounded-lg border border-border bg-muted p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-5 shrink-0 text-primary" />

            <div>
              <p className="font-bold text-primary">
                {t("legalPolicies.applicantAgreement")}
              </p>

              <p className="mt-2 leading-7 text-muted-foreground">
                {t("legalPolicies.applicantAgreementDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-border bg-muted p-5 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          {t("legalPolicies.savingRevisionNote")}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-bold text-foreground transition hover:bg-background"
          >
            <Save className="size-5" />
            {t("legalPolicies.saveDraft")}
          </button>

          <button
            type="button"
            onClick={handlePublish}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <Send className="size-5" />
            {t("legalPolicies.publishPolicy")}
          </button>
        </div>
      </div>
    </section>
  );
}

type EditorActionButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  className?: string;
};

function EditorActionButton({
  icon: Icon,
  label,
  onClick,
  className,
}: EditorActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-bold text-foreground transition hover:bg-muted",
        className
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
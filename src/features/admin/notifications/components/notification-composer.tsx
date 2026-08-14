"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarClock, Save, Send } from "lucide-react";
import { AdminCustomSelect } from "@/components/ui/admin-custom-select";
import {
  notificationTemplates,
  type NotificationAudience,
  type NotificationType,
} from "../data/admin-notifications.data";

export function NotificationComposer() {
  const t = useTranslations("admin");

  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] =
    useState<NotificationAudience>("single_student");
  const [type, setType] = useState<NotificationType>("document");
  const [studentApplicationId, setStudentApplicationId] = useState("");

  function handleTemplateChange(nextTemplateId: string) {
    setTemplateId(nextTemplateId);

    const template = notificationTemplates.find(
      (item) => item.id === nextTemplateId
    );

    if (!template) return;

    setTitle(t(`notifications.templates.${template.id}.title`));
    setMessage(t(`notifications.templates.${template.id}.message`));
  }



  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[0px_8px_30px_rgba(0,77,64,0.06)]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-primary">
          {t("notifications.composeNotification")}
        </h2>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 border border-amber-300">
          PENDING_BACKEND_API
        </span>
      </div>

      <p className="mb-4 text-xs leading-5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
        ملاحظة: واجهة إنتاج وإرسال الإشعارات الجماعية للطلاب (Broadcast Notifications API) غير متوفرة حالياً في الخادم وتنتظر تحديث الخلفية.
      </p>

      <div className="space-y-5 opacity-60 pointer-events-none">
        <AdminCustomSelect
          id="template"
          label={t("notifications.useTemplate")}
          value={templateId}
          onChange={handleTemplateChange}
          options={[
            {
              value: "",
              label: t("notifications.selectTemplate"),
            },
            ...notificationTemplates.map((template) => ({
              value: template.id,
              label: t(`notifications.templates.${template.id}.title`),
            })),
          ]}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminCustomSelect
            id="audience"
            label={t("notifications.audience")}
            value={audience}
            onChange={(value) =>
              setAudience(value as NotificationAudience)
            }
            options={[
              {
                value: "single_student",
                label: t("notifications.audiences.single_student"),
              },
              {
                value: "all_applicants",
                label: t("notifications.audiences.all_applicants"),
              },
              {
                value: "filtered_group",
                label: t("notifications.audiences.filtered_group"),
              },
            ]}
          />

          <AdminCustomSelect
            id="type"
            label={t("notifications.type")}
            value={type}
            onChange={(value) => setType(value as NotificationType)}
            options={[
              {
                value: "document",
                label: t("notifications.types.document"),
              },
              {
                value: "status",
                label: t("notifications.types.status"),
              },
              {
                value: "payment",
                label: t("notifications.types.payment"),
              },
              {
                value: "general",
                label: t("notifications.types.general"),
              },
            ]}
          />
        </div>

        {audience === "single_student" && (
          <FormField label={t("notifications.studentApplicationId")}>
            <input
              id="student"
              type="text"
              value={studentApplicationId}
              onChange={(event) => setStudentApplicationId(event.target.value)}
              placeholder={t("notifications.studentSearchPlaceholder")}
              className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </FormField>
        )}

        <FormField label={t("notifications.notificationTitle")}>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("notifications.titlePlaceholder")}
            className="h-12 w-full rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </FormField>

        <FormField label={t("notifications.message")}>
          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("notifications.messagePlaceholder")}
            className="min-h-[150px] w-full rounded-xl border border-border bg-card p-4 text-sm font-semibold text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            disabled
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary/40 text-sm font-bold text-primary-foreground cursor-not-allowed"
          >
            <Send className="size-5" />
            {t("notifications.sendNow")} (Endpoint غير متوفر)
          </button>

          <button
            type="button"
            disabled
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-secondary/40 text-sm font-bold text-secondary/40 cursor-not-allowed"
          >
            <CalendarClock className="size-5" />
            {t("notifications.schedule")}
          </button>

          <button
            type="button"
            disabled
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold text-muted-foreground cursor-not-allowed"
          >
            <Save className="size-5" />
            {t("notifications.saveDraft")}
          </button>
        </div>
      </div>
    </section>
  );
}

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
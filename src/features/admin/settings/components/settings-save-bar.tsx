"use client";

import { useTranslations } from "next-intl";
import { RotateCcw, Save } from "lucide-react";
import Swal from "sweetalert2";

export function SettingsSaveBar() {
  const t = useTranslations("admin");

  return (
    <div className="sticky bottom-4 z-20 rounded-xl border border-border bg-card/95 p-4 shadow-[0px_12px_40px_rgba(0,0,0,0.12)] backdrop-blur">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-bold text-primary">
            {t("settings.unsavedChanges")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("settings.unsavedChangesDescription")}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              Swal.fire({
                title: "عملية معلقة (PENDING_BACKEND_API)",
                text: "حفظ إعدادات النظام غير متاح بالخلفية حالياً (PENDING_BACKEND_API).",
                icon: "info",
              })
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-5 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            <RotateCcw className="size-5" />
            {t("settings.reset")}
          </button>

          <button
            type="button"
            onClick={() =>
              Swal.fire({
                title: "عملية معلقة (PENDING_BACKEND_API)",
                text: "حفظ إعدادات النظام غير متاح بالخلفية حالياً (PENDING_BACKEND_API).",
                icon: "info",
              })
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary/50 px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/60 cursor-not-allowed"
          >
            <Save className="size-5" />
            {t("settings.saveSettings")} (PENDING)
          </button>
        </div>
      </div>
    </div>
  );
}
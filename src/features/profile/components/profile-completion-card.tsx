"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { useMyProfileQuery } from "@/hooks/queries/use-profile-queries";
import { useMyDocumentsQuery } from "@/hooks/queries/use-documents-queries";

export function ProfileCompletionCard() {
  const t = useTranslations("profile");
  const { data: profile } = useMyProfileQuery();
  const { data: documents } = useMyDocumentsQuery();

  const pi = profile?.personal_information;
  const hasPersonal = Boolean(pi?.first_name_ar || pi?.national_id);
  const hasContact = Boolean(profile?.phone || profile?.email);
  const hasAcademic = Boolean(pi?.first_name_ar);
  const hasDocuments = Boolean(documents && documents.length > 0);

  const completionItems = [
    { key: "personalInformation", completed: hasPersonal },
    { key: "contactInformation", completed: hasContact },
    { key: "academicInformation", completed: hasAcademic },
    { key: "documentsUploaded", completed: hasDocuments },
  ];

  const completedCount = completionItems.filter((i) => i.completed).length;
  const completion = Math.round((completedCount / completionItems.length) * 100);

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-[0px_4px_20px_rgba(0,77,64,0.05)]">
      <h2 className="mb-5 text-xl font-bold text-primary">
        {t("profileCompletion")}
      </h2>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {t("progress")}
          </span>

          <span className="font-bold text-primary">{completion}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {completionItems.map((item) => {
          const Icon = item.completed ? CheckCircle2 : CircleDashed;

          return (
            <div key={item.key} className="flex items-center gap-3">
              <Icon
                className={
                  item.completed
                    ? "size-5 text-primary"
                    : "size-5 text-muted-foreground"
                }
              />

              <span className="text-sm font-medium text-foreground">
                {t(item.key)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
"use client";

import { useTranslations } from "next-intl";

export function AcademicInformationForm() {
  const t = useTranslations("application");

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-6 border-b border-border pb-4 text-xl font-bold text-primary">
        {t("highSchoolInformation")}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="branch"
            className="text-sm font-medium text-foreground"
          >
            {t("highSchoolBranch")}
          </label>

          <select
            id="branch"
            defaultValue="scientific"
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="scientific">{t("scientific")}</option>
            <option value="literary">{t("literary")}</option>
            <option value="industrial">{t("industrial")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="rate" className="text-sm font-medium text-foreground">
            {t("generalAverage")}
          </label>

          <input
            id="rate"
            type="text"
            defaultValue="95.4"
            dir="ltr"
            className="h-12 w-full rounded-lg border border-input bg-card px-4 text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="md:col-span-2">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">
            {t("coreSubjectMarks")}
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SubjectMarkInput label={t("mathematics")} defaultValue="98" />
            <SubjectMarkInput label={t("physics")} defaultValue="92" />
            <SubjectMarkInput label={t("chemistry")} defaultValue="96" />
            <SubjectMarkInput label={t("english")} defaultValue="90" />
          </div>
        </div>
      </div>
    </section>
  );
}

type SubjectMarkInputProps = {
  label: string;
  defaultValue: string;
};

function SubjectMarkInput({ label, defaultValue }: SubjectMarkInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>

      <input
        type="number"
        defaultValue={defaultValue}
        className="h-11 w-full rounded-lg border border-input bg-card px-3 text-center text-base outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
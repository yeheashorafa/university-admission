"use client";

import { useLocale, useTranslations } from "next-intl";
import type { PublicProgram } from "@/services/public-catalog.service";

function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 border-b border-border pb-3 text-xl font-bold text-primary">{title}</h2>
      {children}
    </section>
  );
}

export function ProgramContentSections({ program }: { program: PublicProgram }) {
  const locale = useLocale();
  const t = useTranslations("programsDetails");
  const isArabic = locale === "ar";
  const number = new Intl.NumberFormat(locale);
  const careers = program.career_opportunities ?? [];
  const links = (program.links ?? []).filter((link) => link.is_active && ["source", "study_plan"].includes(link.kind) && /^https?:\/\//i.test(link.url));
  const thresholds = program.admission_thresholds ?? [];
  const fees = program.fees ?? [];

  function localizedText(ar?: string | null, en?: string | null) {
    const hasArabic = Boolean(ar?.trim());
    const hasEnglish = Boolean(en?.trim());
    const showArabic = hasArabic && (isArabic || !hasEnglish);
    return showArabic
      ? <span lang="ar" dir="rtl">{ar}</span>
      : hasEnglish ? <span lang="en" dir="ltr">{en}</span> : null;
  }

  const missingEnglish = !isArabic && [
    [program.description_ar, program.description_en],
    [program.why_study_ar, program.why_study_en],
    ...careers.map((item) => [item.ar, item.en]),
    ...(program.objectives ?? []).map((item) => [item.ar, item.en]),
    ...(program.graduate_outcomes ?? []).map((item) => [item.ar, item.en]),
    ...(program.courses ?? []).map((item) => [item.name_ar, item.name_en]),
  ].some(([ar, en]) => Boolean(ar?.trim()) && !en?.trim());

  const description = localizedText(program.description_ar, program.description_en);
  const whyStudy = localizedText(program.why_study_ar, program.why_study_en);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {missingEnglish && <p role="note" className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">{t("arabicOnlyNotice")}</p>}
      {description && <ContentCard title={t("programOverview")}><p dir="auto" className="leading-8 text-muted-foreground">{description}</p></ContentCard>}
      {whyStudy && <ContentCard title={t("whyStudy")}><p dir="auto" className="leading-8 text-muted-foreground">{whyStudy}</p></ContentCard>}

      {thresholds.length > 0 && (
        <ContentCard title={t("admissionRequirements")}>
          <table className="w-full table-fixed text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th scope="col" className="w-2/5 py-2 text-start">{t("branch")}</th>
                <th scope="col" className="py-2 text-start">{t("gender")}</th>
                <th scope="col" className="py-2 text-end">{t("minimumRate")}</th>
              </tr>
            </thead>
            <tbody>
              {thresholds.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="py-3 pe-2">{localizedText(item.branch.name_ar, item.branch.name_en)}</td>
                  <td className="py-3">{t(item.gender)}</td>
                  <td className="py-3 text-end tabular-nums">{number.format(Number(item.min_average_percent))}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ContentCard>
      )}

      {fees.length > 0 && (
        <ContentCard title={t("indicativeFees")}>
          {fees.map((fee) => (
            <dl key={fee.id} className="grid grid-cols-2 gap-3 py-2 text-sm">
              <div><dt className="text-muted-foreground">{t("ratePerCredit")}</dt><dd className="mt-1 font-semibold">{t("dinarAmount", { amount: number.format(Number(fee.price_per_hour_dinar)) })}</dd></div>
              <div><dt className="text-muted-foreground">{t("creditHours")}</dt><dd className="mt-1 font-semibold">{number.format(fee.credit_hours)}</dd></div>
            </dl>
          ))}
        </ContentCard>
      )}

      {careers.length > 0 && (
        <ContentCard title={t("careerOpportunities")}>
          <ul className="list-disc space-y-2 ps-5">{careers.map((career) => <li key={career.id} dir="auto">{localizedText(career.ar, career.en)}</li>)}</ul>
        </ContentCard>
      )}
      {links.length > 0 && (
        <ContentCard title={t("catalogLinks")}>
          <ul className="space-y-2">{links.map((link) => (
            <li key={link.id}><a className="font-semibold text-primary underline underline-offset-4" href={link.url} target="_blank" rel="noopener noreferrer">{localizedText(link.label_ar, link.label_en) ?? t(link.kind === "source" ? "sourceLink" : "studyPlanLink")}</a></li>
          ))}</ul>
        </ContentCard>
      )}

      {[
        { title: t("objectives"), items: program.objectives },
        { title: t("learningOutcomes"), items: program.graduate_outcomes },
        { title: t("courses"), items: program.courses?.map((course) => ({ id: course.id, ar: course.name_ar, en: course.name_en })) },
      ].map(({ title, items }) => items?.length ? (
        <ContentCard key={title} title={title}>
          <ul className="list-disc space-y-2 ps-5">{items.map((item) => <li key={item.id} dir="auto">{localizedText(item.ar, item.en)}</li>)}</ul>
        </ContentCard>
      ) : null)}
    </div>
  );
}

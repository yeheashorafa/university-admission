"use client"
import { useTranslations } from "next-intl";
import { ApplicationFooter } from "./components/application-footer";
import { ApplicationHeader } from "./components/application-header";
import { ApplicationWizard } from "./components/application-wizard";

export function ApplicationPage() {
  const t = useTranslations("application");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ApplicationHeader />

      <main className="app-container flex flex-1 flex-col gap-6 py-8">
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
             {t("applicationHeader")}
          </p>

          <h1 className="text-3xl font-extrabold text-[#12360b] dark:text-[#8bd63a] md:text-4xl">
            {t("applicationTitle")}
          </h1>
        </div>

        <ApplicationWizard />
      </main>

      <ApplicationFooter />
    </div>
  );
}
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ibmPlexSansArabic, ibmPlexSansEnglish } from "@/lib/fonts";
import { routing } from "@/i18n/routing";
import { AppProviders } from "@/components/providers/app-providers";
import { cookies } from "next/headers";
import "../globals.css";

export const metadata: Metadata = {
  title: "University Admission",
  description: "University Admission System",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  const isRTL = locale === "ar";
  const messages = await getMessages({ locale });
  const cookieStore = await cookies();
  const theme = cookieStore.get("app_theme")?.value;
  const isDark = theme === "dark";

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      className={`${ibmPlexSansArabic.variable} ${ibmPlexSansEnglish.variable} ${
        isDark ? "dark" : ""
      } h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
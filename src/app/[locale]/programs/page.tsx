import { redirect } from "next/navigation";
import { routes, withLocale } from "@/constants/routes";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function ProgramsRedirectPage({ params }: PageProps) {
  const { locale } = await params;
  redirect(withLocale(locale, routes.faculties));
}
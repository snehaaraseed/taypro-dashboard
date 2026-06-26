import { setRequestLocale } from "next-intl/server";
import { isActiveLocale } from "@/i18n/markets";
import { notFound } from "next/navigation";

type ProjectsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Project copy is provided by the root locale NextIntlClientProvider (SPA-safe). */
export default async function ProjectsSectionLayout({
  children,
  params,
}: ProjectsLayoutProps) {
  const { locale } = await params;
  if (!isActiveLocale(locale)) notFound();

  setRequestLocale(locale);
  return children;
}

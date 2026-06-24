import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { pickMessages } from "@/i18n/pick-messages";
import { isActiveLocale } from "@/i18n/markets";
import { notFound } from "next/navigation";

const PROJECTS_CLIENT_NAMESPACES = [
  "ProjectsPage",
  "ProjectsFilterPage",
  "ProjectDetailPage",
] as const;

type ProjectsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Merges project UI strings on client navigations into /projects/* (nested provider). */
export default async function ProjectsSectionLayout({
  children,
  params,
}: ProjectsLayoutProps) {
  const { locale } = await params;
  if (!isActiveLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = pickMessages(await getMessages(), PROJECTS_CLIENT_NAMESPACES);
  if (Object.keys(messages).length === 0) return children;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

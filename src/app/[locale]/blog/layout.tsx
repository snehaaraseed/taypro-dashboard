import { setRequestLocale } from "next-intl/server";
import { isActiveLocale } from "@/i18n/markets";
import { notFound } from "next/navigation";

type BlogLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Blog copy is provided by the root locale NextIntlClientProvider (SPA-safe). */
export default async function BlogSectionLayout({
  children,
  params,
}: BlogLayoutProps) {
  const { locale } = await params;
  if (!isActiveLocale(locale)) notFound();

  setRequestLocale(locale);
  return children;
}

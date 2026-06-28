import { setRequestLocale } from "next-intl/server";
import { isActiveLocale } from "@/i18n/markets";
import { notFound } from "next/navigation";

type BlogLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Blog client copy is pathname-scoped in the root layout; extra namespaces load on navigation. */
export default async function BlogSectionLayout({
  children,
  params,
}: BlogLayoutProps) {
  const { locale } = await params;
  if (!isActiveLocale(locale)) notFound();

  setRequestLocale(locale);
  return children;
}

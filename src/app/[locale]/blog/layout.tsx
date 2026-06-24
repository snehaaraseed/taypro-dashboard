import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { pickMessages } from "@/i18n/pick-messages";
import { isActiveLocale } from "@/i18n/markets";
import { notFound } from "next/navigation";

const BLOG_CLIENT_NAMESPACES = ["BlogPage"] as const;

type BlogLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Merges blog UI strings on client navigations into /blog/* (nested provider). */
export default async function BlogSectionLayout({
  children,
  params,
}: BlogLayoutProps) {
  const { locale } = await params;
  if (!isActiveLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = pickMessages(await getMessages(), BLOG_CLIENT_NAMESPACES);
  if (Object.keys(messages).length === 0) return children;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

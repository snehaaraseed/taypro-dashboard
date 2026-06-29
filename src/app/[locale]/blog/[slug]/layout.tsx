import { setRequestLocale } from "next-intl/server";
import { AugmentIntlMessages } from "@/app/components/AugmentIntlMessages";
import { pickMessages } from "@/i18n/pick-messages";
import { loadMessagesForClient } from "@/i18n/load-messages";

const BLOG_DETAIL_CLIENT_NAMESPACES = ["BlogPage"] as const;

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function BlogDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const catalog = await loadMessagesForClient(locale);
  const pageMessages = pickMessages(catalog, [...BLOG_DETAIL_CLIENT_NAMESPACES]);

  return (
    <AugmentIntlMessages messages={pageMessages}>{children}</AugmentIntlMessages>
  );
}

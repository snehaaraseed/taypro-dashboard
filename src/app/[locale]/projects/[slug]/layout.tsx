import { setRequestLocale } from "next-intl/server";
import { AugmentIntlMessages } from "@/app/components/AugmentIntlMessages";
import { pickMessages } from "@/i18n/pick-messages";
import { loadMessagesForClient } from "@/i18n/load-messages";

const PROJECT_DETAIL_CLIENT_NAMESPACES = [
  "ProjectDetailPage",
  "ProjectsPage",
] as const;

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProjectDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const catalog = await loadMessagesForClient(locale);
  const pageMessages = pickMessages(catalog, [
    ...PROJECT_DETAIL_CLIENT_NAMESPACES,
  ]);

  return (
    <AugmentIntlMessages messages={pageMessages}>{children}</AugmentIntlMessages>
  );
}

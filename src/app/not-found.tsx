import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import NotFoundContent from "@/app/components/NotFoundContent";
import LeadModalRoot from "@/app/components/LeadModalRoot";
import { buildNotFoundLabels } from "@/lib/not-found-labels";
import { loadMessages } from "@/i18n/load-messages";

export const metadata: Metadata = {
  title: "Page Not Found | Taypro",
  description:
    "The page you requested is not available. Taypro.in is online, explore solar panel cleaning robots, projects, and contact options.",
  robots: { index: false, follow: true },
};

export default async function RootNotFoundPage() {
  const messages = await loadMessages("en");
  const notFoundMessages = messages.NotFoundPage as Record<
    string,
    string | Record<string, string>
  >;

  const labels = buildNotFoundLabels((key) => {
    const value = notFoundMessages[key];
    return typeof value === "string" ? value : key;
  });

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <LeadModalRoot>
        <NotFoundContent labels={labels} />
      </LeadModalRoot>
    </NextIntlClientProvider>
  );
}

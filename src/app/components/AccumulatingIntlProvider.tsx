"use client";

import { NextIntlClientProvider } from "next-intl";

type ClientIntlProviderProps = {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
};

/** Thin client wrapper — full SPA namespaces are embedded in layout HTML. */
export default function AccumulatingIntlProvider({
  locale,
  messages,
  children,
}: ClientIntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Kolkata"
    >
      {children}
    </NextIntlClientProvider>
  );
}

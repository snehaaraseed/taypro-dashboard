"use client";

import { NextIntlClientProvider } from "next-intl";

type AccumulatingIntlProviderProps = {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
};

/** Root intl provider — full SPA catalog is passed from the locale layout. */
export default function AccumulatingIntlProvider({
  locale,
  messages,
  children,
}: AccumulatingIntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Kolkata">
      {children}
    </NextIntlClientProvider>
  );
}

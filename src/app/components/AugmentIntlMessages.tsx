"use client";

import { NextIntlClientProvider, useLocale, useMessages } from "next-intl";
import { useLayoutEffect, useMemo, type ReactNode } from "react";
import { mergeMessageNamespaces } from "@/i18n/pick-messages";
import { seedClientNamespaceCache } from "@/i18n/prefetch-client-namespaces";

type AugmentIntlMessagesProps = {
  messages: Record<string, unknown>;
  children: ReactNode;
};

/**
 * Merges route-scoped namespaces into the root layout provider so client widgets
 * (newsletter, PDF button, etc.) resolve copy on first paint, not after fetch.
 */
export function AugmentIntlMessages({
  messages,
  children,
}: AugmentIntlMessagesProps) {
  const locale = useLocale();
  const parentMessages = useMessages();
  const merged = useMemo(
    () =>
      mergeMessageNamespaces(
        parentMessages as Record<string, unknown>,
        messages
      ),
    [parentMessages, messages]
  );

  useLayoutEffect(() => {
    seedClientNamespaceCache(locale, messages);
  }, [locale, messages]);

  return (
    <NextIntlClientProvider locale={locale} messages={merged}>
      {children}
    </NextIntlClientProvider>
  );
}

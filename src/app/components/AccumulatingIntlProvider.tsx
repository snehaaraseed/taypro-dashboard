"use client";

import { NextIntlClientProvider } from "next-intl";
import { usePathname as useNextPathname } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { clientNamespacesForRequest } from "@/i18n/client-message-namespaces";
import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";
import {
  fetchClientNamespaces,
  readCachedClientNamespaces,
  seedClientNamespaceCache,
} from "@/i18n/prefetch-client-namespaces";
import { mergeMessageNamespaces } from "@/i18n/pick-messages";

type ClientIntlProviderProps = {
  locale: string;
  messages: Record<string, unknown>;
  /** SSR pathname scope from middleware (no intl context required). */
  initialLogicalPath?: string;
  children: React.ReactNode;
};

/** Pathname-scoped layout messages; fetches extra namespaces on client navigation. */
export default function AccumulatingIntlProvider({
  locale,
  messages: initialMessages,
  initialLogicalPath = "/",
  children,
}: ClientIntlProviderProps) {
  const nextPathname = useNextPathname();
  const logicalPath = useMemo(
    () => pathnameWithoutLocale(nextPathname ?? initialLogicalPath),
    [nextPathname, initialLogicalPath]
  );
  const [messages, setMessages] = useState(initialMessages);
  const loadedRef = useRef(new Set(Object.keys(initialMessages)));

  useLayoutEffect(() => {
    seedClientNamespaceCache(locale, initialMessages);
    setMessages((prev) => mergeMessageNamespaces(prev, initialMessages));
    for (const ns of Object.keys(initialMessages)) {
      loadedRef.current.add(ns);
    }
  }, [initialMessages, locale]);

  useLayoutEffect(() => {
    const needed = clientNamespacesForRequest(logicalPath);
    const missing = needed.filter((ns) => !loadedRef.current.has(ns));
    if (missing.length === 0) return;

    const cached = readCachedClientNamespaces(locale, missing);
    if (Object.keys(cached).length > 0) {
      for (const ns of Object.keys(cached)) {
        loadedRef.current.add(ns);
      }
      setMessages((prev) => mergeMessageNamespaces(prev, cached));
    }

    const stillMissing = missing.filter((ns) => !loadedRef.current.has(ns));
    if (stillMissing.length === 0) return;

    let cancelled = false;

    void fetchClientNamespaces(locale, stillMissing).then(
      (fetched: Record<string, unknown>) => {
      if (cancelled || Object.keys(fetched).length === 0) return;

      for (const ns of Object.keys(fetched)) {
        if (stillMissing.includes(ns)) {
          loadedRef.current.add(ns);
        }
      }
      setMessages((prev) => mergeMessageNamespaces(prev, fetched));
    }
    );

    return () => {
      cancelled = true;
    };
  }, [logicalPath, locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Kolkata"
      onError={(error) => {
        if (error.code === "MISSING_MESSAGE") return;
        console.error(error);
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}

import { clientNamespacesForRequest } from "@/i18n/client-message-namespaces";
import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";

const namespaceCache = new Map<string, unknown>();

function cacheKey(locale: string, namespace: string): string {
  return `${locale}:${namespace}`;
}

export function seedClientNamespaceCache(
  locale: string,
  messages: Record<string, unknown>
): void {
  for (const [ns, value] of Object.entries(messages)) {
    namespaceCache.set(cacheKey(locale, ns), value);
  }
}

export function readCachedClientNamespaces(
  locale: string,
  namespaces: string[]
): Record<string, unknown> {
  const messages: Record<string, unknown> = {};
  for (const ns of namespaces) {
    const cached = namespaceCache.get(cacheKey(locale, ns));
    if (cached !== undefined) {
      messages[ns] = cached;
    }
  }
  return messages;
}

export async function fetchClientNamespaces(
  locale: string,
  namespaces: string[]
): Promise<Record<string, unknown>> {
  if (namespaces.length === 0) return {};

  const messages: Record<string, unknown> = {};
  const missing: string[] = [];

  for (const ns of namespaces) {
    const key = cacheKey(locale, ns);
    if (namespaceCache.has(key)) {
      messages[ns] = namespaceCache.get(key);
    } else {
      missing.push(ns);
    }
  }

  if (missing.length === 0) return messages;

  const params = new URLSearchParams({
    locale,
    ns: missing.join(","),
  });
  const res = await fetch(`/api/i18n/messages?${params.toString()}`);
  if (!res.ok) return messages;

  const data = (await res.json()) as { messages?: Record<string, unknown> };
  const fetched = data.messages ?? {};

  for (const [ns, value] of Object.entries(fetched)) {
    namespaceCache.set(cacheKey(locale, ns), value);
    messages[ns] = value;
  }

  return messages;
}

/** Warm the client namespace cache before navigation (e.g. header link hover). */
export function prefetchClientNamespacesForPath(
  locale: string,
  href: string
): void {
  const logicalPath = pathnameWithoutLocale(href.split("#")[0] ?? href);
  const needed = clientNamespacesForRequest(logicalPath);
  const missing = needed.filter(
    (ns) => !namespaceCache.has(cacheKey(locale, ns))
  );
  if (missing.length === 0) return;

  void fetchClientNamespaces(locale, missing);
}

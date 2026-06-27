import {
  LAYOUT_CLIENT_NAMESPACES,
  SPA_CLIENT_NAMESPACES,
  clientNamespacesForPathname,
} from "@/i18n/client-message-namespaces";
import { loadMessagesForClient } from "@/i18n/load-messages";
import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";

/** @deprecated Nested intl providers were removed; kept for any legacy imports. */
export const NESTED_INTL_BASE_NAMESPACES = SPA_CLIENT_NAMESPACES;

export function pickMessages(
  messages: Record<string, unknown>,
  namespaces: readonly string[]
): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const key of namespaces) {
    if (key in messages) {
      picked[key] = messages[key];
    }
  }
  return picked;
}

/** Shallow-merge top-level message namespaces (SPA accumulation). */
export function mergeMessageNamespaces(
  base: Record<string, unknown>,
  extra: Record<string, unknown>
): Record<string, unknown> {
  return { ...base, ...extra };
}

/**
 * Full client catalog (API allowlist / tests). Do not use for root layout.
 */
export function buildSpaClientMessages(
  messages: Record<string, unknown>
): Record<string, unknown> {
  return pickMessages(messages, SPA_CLIENT_NAMESPACES);
}

/**
 * Pathname-scoped client bundle for the root locale layout (first paint).
 */
export function buildLayoutClientMessages(
  messages: Record<string, unknown>,
  logicalPathname = "/"
): Record<string, unknown> {
  const namespaceSet = new Set<string>([
    ...LAYOUT_CLIENT_NAMESPACES,
    ...clientNamespacesForPathname(logicalPathname),
  ]);
  return pickMessages(messages, [...namespaceSet]);
}

/** Load and pick namespaces from the full client catalog. */
export async function loadPickedClientNamespaces(
  locale: string,
  _logicalPathname: string,
  namespaces: string[]
): Promise<Record<string, unknown>> {
  const messages = await loadMessagesForClient(locale);
  return pickMessages(messages, namespaces);
}

/**
 * Pathname-scoped client bundle (e.g. one-off nested providers).
 */
export function buildClientMessages(
  messages: Record<string, unknown>,
  pathname: string
): Record<string, unknown> {
  const namespaceSet = new Set<string>([
    ...LAYOUT_CLIENT_NAMESPACES,
    ...clientNamespacesForPathname(pathname),
  ]);

  const path = pathnameWithoutLocale(pathname);
  if (path === "/" || path === "") {
    namespaceSet.add("Home");
    namespaceSet.add("PriceCalculatorPage");
  }

  return pickMessages(messages, [...namespaceSet]);
}

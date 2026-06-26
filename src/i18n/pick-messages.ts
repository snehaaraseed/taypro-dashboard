import {
  LAYOUT_CLIENT_NAMESPACES,
  SPA_CLIENT_NAMESPACES,
  clientNamespacesForPathname,
} from "@/i18n/client-message-namespaces";
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

/**
 * Full client catalog for the root locale layout.
 * Shared layouts do not re-render on SPA navigation, so client `"use client"`
 * pages/widgets must receive every SPA namespace on the first paint.
 * Server `getTranslations` stays pathname-scoped via `loadMessagesForPath`.
 */
export function buildSpaClientMessages(
  messages: Record<string, unknown>
): Record<string, unknown> {
  return pickMessages(messages, SPA_CLIENT_NAMESPACES);
}

/**
 * Pathname-scoped client bundle (tests, diagnostics).
 * Do not use for the root layout — SPA navigations will miss namespaces.
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

/**
 * Pathname-scoped client bundle (e.g. one-off nested providers).
 * Prefer buildLayoutClientMessages for the root locale layout.
 */
export function buildClientMessages(
  messages: Record<string, unknown>,
  pathname: string
): Record<string, unknown> {
  const namespaceSet = new Set<string>([
    ...SPA_CLIENT_NAMESPACES,
    ...clientNamespacesForPathname(pathname),
  ]);

  const path = pathnameWithoutLocale(pathname);
  if (path === "/" || path === "") {
    namespaceSet.add("Home");
    namespaceSet.add("PriceCalculatorPage");
  }

  return pickMessages(messages, [...namespaceSet]);
}

import {
  CLIENT_PAGE_NAMESPACES,
  LAYOUT_CLIENT_NAMESPACES,
  clientNamespacesForRequest,
} from "@/i18n/client-message-namespaces";
import { pathnameWithoutLocale } from "@/i18n/pathname-without-locale";

/** Always ship these to the client when present (layout chrome + lead forms). */
const GLOBAL_CLIENT_NAMESPACES = ["Common", "Forms"] as const;

/** Top-level namespaces passed to NextIntlClientProvider (reduces serialized HTML). */
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
 * Client bundle for locale layout — pathname-independent so layouts can be static/ISR.
 * Admin publish routes call revalidatePath when CMS content changes.
 */
export function buildLayoutClientMessages(
  messages: Record<string, unknown>
): Record<string, unknown> {
  const namespaceSet = new Set<string>([
    ...LAYOUT_CLIENT_NAMESPACES,
    ...CLIENT_PAGE_NAMESPACES,
    ...GLOBAL_CLIENT_NAMESPACES,
  ]);
  return pickMessages(messages, [...namespaceSet]);
}

/**
 * Build the client message bundle for a request pathname.
 * Ensures global namespaces and home-only namespaces are never dropped.
 */
export function buildClientMessages(
  messages: Record<string, unknown>,
  pathname: string
): Record<string, unknown> {
  const namespaceSet = new Set<string>([
    ...clientNamespacesForRequest(pathname),
    ...GLOBAL_CLIENT_NAMESPACES,
  ]);

  const path = pathnameWithoutLocale(pathname);
  if (path === "/" || path === "") {
    namespaceSet.add("Home");
    namespaceSet.add("PriceCalculatorPage");
  }

  return pickMessages(messages, [...namespaceSet]);
}

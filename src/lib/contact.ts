/**
 * Taypro sales line (IndiaMART IRN / Pune 080).
 * Use E.164 + international display so Tier-1 and Japan visitors can dial from abroad.
 */
export const TAYPRO_SALES_PHONE_E164 = "+918043843569";

/** Human-readable international format (shown in header, footer, contact, legal). */
export const TAYPRO_SALES_PHONE_DISPLAY = "+91 80438 43569";

export const TAYPRO_SALES_PHONE_TEL = `tel:${TAYPRO_SALES_PHONE_E164}`;

export type TayproEmailMailbox = "sales" | "service";

/** Character codes, avoids a harvestable address string in static HTML/JSON. */
const MAILBOX_PARTS: Record<TayproEmailMailbox, readonly number[][]> = {
  sales: [
    [115, 97, 108, 101, 115],
    [116, 97, 121, 112, 114, 111, 46, 105, 110],
  ],
  service: [
    [115, 101, 114, 118, 105, 99, 101],
    [116, 97, 121, 112, 114, 111, 46, 105, 110],
  ],
};

function decodeMailboxParts(parts: readonly number[][]): string {
  const [local, domain] = parts;
  return `${String.fromCharCode(...local)}@${String.fromCharCode(...domain)}`;
}

/** Resolve a Taypro mailbox address at runtime (client-only usage for public pages). */
export function getTayproEmailAddress(mailbox: TayproEmailMailbox): string {
  return decodeMailboxParts(MAILBOX_PARTS[mailbox]);
}

export function buildTayproMailtoHref(
  mailbox: TayproEmailMailbox,
  options?: { subject?: string; body?: string },
): string {
  const address = getTayproEmailAddress(mailbox);
  const base = `mailto:${address}`;
  if (!options?.subject && !options?.body) return base;
  const params = new URLSearchParams();
  if (options.subject) params.set("subject", options.subject);
  if (options.body) params.set("body", options.body);
  return `${base}?${params.toString()}`;
}

/**
 * List prices (INR) for JSON-LD Product / Offer schema only.
 * Final quotes vary by plant layout, fleet size, and customization.
 */
export const PRODUCT_SCHEMA_OFFER_PRICES_INR = {
  home: "90000",
  glyde: "90000",
  nyuma: "90000",
  glydeX: "8000",
  nyumaX: "8000",
  helyx: "90000",
  miny: "30000",
  orion: "5000",
  cradyl: "150000",
  nectyr: "15000",
  opexService: "8000",
} as const;

export type ProductSchemaPriceKey = keyof typeof PRODUCT_SCHEMA_OFFER_PRICES_INR;

export const STANDARD_PRODUCT_OFFER_PRICE_INR = "90000";

export function getProductSchemaOfferPrice(
  key?: ProductSchemaPriceKey,
  fallbackPrice?: string
): string {
  if (key) {
    return PRODUCT_SCHEMA_OFFER_PRICES_INR[key];
  }
  const trimmed = fallbackPrice?.trim();
  if (trimmed && /^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return trimmed;
  }
  return STANDARD_PRODUCT_OFFER_PRICE_INR;
}

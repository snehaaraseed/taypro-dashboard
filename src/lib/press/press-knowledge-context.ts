import "server-only";

import {
  getProductKnowledgeBase,
  type ProductKnowledgeFocus,
} from "@/lib/productKnowledge";
import { formatPublicProofBlock } from "@/lib/seo/blog-knowledge-context";
import type { PressQueueItem } from "@/lib/press/press-release-queue";

const PRODUCT_NAMING_RULES = `
TAYPRO PRODUCT NAMING (mandatory in all press releases):
- Use official product names ONLY: GLYDE, GLYDE-X, NYUMA, NYUMA-X, HELYX, CRADYL, MINY, NECTYR
- CRADYL is Taypro's row-transfer movable docking station — NOT "MDS" and NOT "Movable Docking Station" as the product name
- First mention: "CRADYL" or "Taypro CRADYL row-transfer docking station"; optional descriptor "(movable docking station)" only after CRADYL is named
- Do NOT invent abbreviations (MDS, etc.) or generic competitor-style product labels
- Robot specs: use PRODUCT KNOWLEDGE BASE only; company fleet stats: use PUBLIC PROOF POINTS only
- Do not invent client names, statistics, or model codes not listed below
`.trim();

export function buildPressKnowledgeContext(item: PressQueueItem): string {
  const focus = item.productFocus?.length ? item.productFocus : undefined;
  const productKnowledge = getProductKnowledgeBase(focus);
  const proofBlock = formatPublicProofBlock();

  const focusNote =
    focus?.length ?
      `\nPRODUCT FOCUS for this release: ${focus.map((p) => p.toUpperCase()).join(", ")} — lead with these products and use their official names.\n`
    : "";

  return `
${PRODUCT_NAMING_RULES}
${focusNote}
${productKnowledge}

${proofBlock}
`.trim();
}

export function enforcePressProductNaming(
  text: string,
  productFocus?: ProductKnowledgeFocus[]
): string {
  if (!productFocus?.includes("cradyl")) return text;

  let out = text;
  out = out.replace(
    /\bMovable Docking Station\s*\(\s*MDS\s*\)/gi,
    "CRADYL row-transfer docking station"
  );
  out = out.replace(
    /\b(?:the\s+)?Movable Docking Station\b/gi,
    "CRADYL row-transfer docking station"
  );
  out = out.replace(/\bMDS\b/g, "CRADYL");
  return out;
}

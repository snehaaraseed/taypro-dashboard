/**
 * Product Knowledge Base — verified specs for Taypro robots and services.
 * Used in AI prompts to prevent hallucination. No panel-count or legacy model codes.
 */

import { PRODUCT_CATALOG, type ProductId } from "@/lib/products/catalog";

export interface ProductSpec {
  itemName: string;
  plantType: string;
  cleaningTechnology: string;
  autonomy: string;
  specifications: Record<string, string | number | string[]>;
  features: string[];
  suitableFor: string[];
  description: string;
  forbiddenClaims: string[];
}

export interface ServiceSpec {
  name: string;
  description: string;
  features: string[];
  benefits: string[];
}

function specFromCatalog(id: ProductId, extra: Partial<ProductSpec>): ProductSpec {
  const p = PRODUCT_CATALOG[id];
  return {
    itemName: p.itemName,
    plantType: p.plantType,
    cleaningTechnology: p.cleaningTechnology,
    autonomy: p.autonomy,
    specifications: {},
    features: [],
    suitableFor: [],
    description: p.description,
    forbiddenClaims: [],
    ...extra,
  };
}

export const helyx = specFromCatalog("helyx", {
  specifications: {
    weight: "39 kg",
    speed: "10–15 metres per minute",
    range: "Up to 3 km per charge",
    cleaningMaterial: "UV-stable PBT brush (single-pass)",
  },
  features: [
    "Pick-and-place semi-automatic deployment",
    "Single-pass PBT waterless cleaning",
    "Portable across scattered plant blocks",
    "Fall prevention and panel-safe contact",
  ],
  suitableFor: [
    "Scattered and distributed utility-scale plants",
    "Fixed-tilt and seasonal-tilt layouts",
  ],
  forbiddenClaims: ["dual-pass", "microfiber", "patented dual-pass"],
});

export const nyuma = specFromCatalog("nyuma", {
  specifications: {
    dimensions: "690 mm × 4800 mm",
    weight: "45 kg",
    speed: "10–15 metres per minute",
    range: "Up to 2.2 km per charge (~3,600 modules)",
    recommendedRange: "1.6 km",
    cleaningMaterial: "UV-stable PBT brush, 5-start helix (single-pass)",
    ipRating: "IP65",
    maxTilt: "45°",
    maxTerrainSlope: "15° E–W",
    maxOperatingTemp: "90°C",
  },
  features: [
    "Fully autonomous single-pass PBT cleaning",
    "AI/ML scheduling via NECTYR",
    "LTE and Wi-Fi connectivity",
    "Edge and obstacle detection",
    "Self-docking charging",
  ],
  suitableFor: ["Fixed-tilt utility-scale plants", "Seasonal-tilt installations"],
  forbiddenClaims: ["dual-pass", "microfiber", "patented dual-pass"],
});

export const glyde = specFromCatalog("glyde", {
  specifications: {
    range: "Up to 2.2 km per charge (~3,600 modules)",
    speed: "10–15 metres per minute",
    cleaningMethod: "Patented dual-pass (airflow + microfiber)",
  },
  features: [
    "Patented dual-pass microfiber cleaning (core TAYPRO technology)",
    "Fully autonomous waterless operation",
    "AI/ML scheduling",
    "RF mesh and NECTYR connectivity",
  ],
  suitableFor: ["Fixed-tilt utility-scale plants", "Seasonal-tilt installations"],
  forbiddenClaims: ["PBT-only primary cleaning", "single-pass PBT as main method"],
});

export const nyumaX = specFromCatalog("nyumaX", {
  specifications: {
    cleaningMaterial: "UV-stable PBT brush (single-pass)",
    bodyArticulation: "Flexible body for tracker tables",
    moduleTiltRange: "-52° to +52° (typical tracker range)",
  },
  features: [
    "Single-pass PBT cleaning on single-axis trackers",
    "Flexible body for inter-table movement",
    "Compatible with NEXTracker, Gamechanger and equivalent trackers",
    "Fully autonomous with NECTYR",
  ],
  suitableFor: ["Horizontal single-axis tracker plants"],
  forbiddenClaims: ["dual-pass", "microfiber", "patented dual-pass"],
});

export const glydeX = specFromCatalog("glydeX", {
  specifications: {
    cleaningMethod: "Patented dual-pass (airflow + microfiber)",
    bodyArticulation: "Flexible body; 360° rotational bridge",
    moduleTiltRange: "-52° to +52°",
  },
  features: [
    "Patented dual-pass microfiber on tracker plants",
    "Flexible body and 360° bridge for tracker tables",
    "NEXTracker and Gamechanger compatible",
    "Fully autonomous with NECTYR",
  ],
  suitableFor: ["Horizontal single-axis tracker plants"],
  forbiddenClaims: ["PBT-only primary cleaning"],
});

export const tayproOPEX: ServiceSpec = {
  name: "Taypro OPEX",
  description:
    "Solar panel cleaning service — OPEX model with dedicated skilled manpower",
  features: [
    "Dedicated skilled manpower for robot operation",
    "Fleet may include HELYX, GLYDE, GLYDE-X, NYUMA, or NYUMA-X as required",
    "Real-time monitoring via NECTYR",
    "Same-day breakdown resolution targets",
  ],
  benefits: [
    "No upfront capital investment",
    "Professional service management",
    "Guaranteed uptime targets",
  ],
};

export const tayproConsole: ServiceSpec = {
  name: "NECTYR",
  description: "Fleet monitoring for solar panel cleaning robots",
  features: [
    "Real-time monitoring",
    "Remote scheduling",
    "Performance tracking and alerts",
    "Weather-aware optimization",
  ],
  benefits: [
    "Centralized fleet management",
    "Proactive maintenance",
    "Data-driven insights",
  ],
};

export const generalFeatures = {
  allModels: [
    "Waterless cleaning technology",
    "AI and ML scheduling options",
    "NECTYR fleet portal",
    "Pan-India service and AMC options",
  ],
  certifications: [
    "ISO 9001 (Quality Management)",
    "ISO 14001 (Environmental Management)",
    "TÜV NORD testing (select platforms)",
  ],
  patents: ["Dual Pass Cleaning System (GLYDE and GLYDE-X)", "RF Mesh Communication"],
};

export function getProductKnowledgeBase(): string {
  const products = [glyde, glydeX, nyuma, nyumaX, helyx];
  const blocks = products.map(
    (p) => `
${p.itemName.toUpperCase()}:
- Plant fit: ${p.suitableFor.join("; ")}
- Cleaning: ${p.cleaningTechnology}
- Autonomy: ${p.autonomy}
- Description: ${p.description}
- Key specs: ${JSON.stringify(p.specifications)}
- Features: ${p.features.join("; ")}
- DO NOT claim: ${p.forbiddenClaims.join(", ")}
`
  );

  return `
TAYPRO PRODUCT KNOWLEDGE BASE — VERIFIED INFORMATION ONLY

${blocks.join("\n")}

TAYPRO OPEX: ${tayproOPEX.description}
NECTYR: ${tayproConsole.description}

GENERAL:
- Product names on the website: GLYDE, GLYDE-X, NYUMA, NYUMA-X, HELYX, NECTYR only (no legacy Model-A/B/T or NECTYR in customer copy)
- GLYDE and GLYDE-X use patented dual-pass microfiber; HELYX, NYUMA, NYUMA-X use single-pass PBT only
- Do not invent specifications not listed above
`;
}

/** @deprecated Use glyde */
export const modelA = glyde;
/** @deprecated Use helyx */
export const modelB = helyx;
/** @deprecated Use glydeX */
export const modelT = glydeX;

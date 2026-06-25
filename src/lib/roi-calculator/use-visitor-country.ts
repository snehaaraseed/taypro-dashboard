"use client";

import { useVisitorGeoCountry } from "@/lib/roi-calculator/visitor-geo-context";

/** ISO country from middleware geo header (server-seeded, HttpOnly cookie on origin). */
export function useVisitorCountry(): string | null {
  return useVisitorGeoCountry();
}

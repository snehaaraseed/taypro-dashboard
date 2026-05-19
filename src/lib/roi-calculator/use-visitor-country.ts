"use client";

import { useEffect, useState } from "react";
import { VISITOR_COUNTRY_COOKIE } from "@/lib/roi-calculator/currency";

function readCountryCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${VISITOR_COUNTRY_COOKIE}=([^;]*)`)
  );
  const value = match?.[1]?.trim().toUpperCase();
  return value && /^[A-Z]{2}$/.test(value) ? value : null;
}

/** ISO country from middleware geo cookie (null until hydrated on client). */
export function useVisitorCountry(): string | null {
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    setCountry(readCountryCookie());
  }, []);

  return country;
}

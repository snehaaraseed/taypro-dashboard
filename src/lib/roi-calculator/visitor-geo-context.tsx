"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const VisitorGeoContext = createContext<string | null>(null);

/**
 * Provides the visitor's ISO country to client widgets (ROI calculator market
 * defaults). Resolved client-side from `/api/geo` so the surrounding page HTML
 * stays visitor-agnostic and can be statically rendered + edge-cached. An
 * optional `country` seed is supported for tests / non-static callers.
 */
export function VisitorGeoProvider({
  country = null,
  children,
}: {
  country?: string | null;
  children: ReactNode;
}) {
  const [resolved, setResolved] = useState<string | null>(country);

  useEffect(() => {
    if (resolved) return;
    let cancelled = false;

    fetch("/api/geo", { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { country?: unknown } | null) => {
        if (cancelled || !data) return;
        const code =
          typeof data.country === "string"
            ? data.country.trim().toUpperCase()
            : "";
        if (/^[A-Z]{2}$/.test(code)) {
          setResolved(code);
        }
      })
      .catch(() => {
        // Geo is a progressive enhancement; ignore failures (defaults to India).
      });

    return () => {
      cancelled = true;
    };
  }, [resolved]);

  return (
    <VisitorGeoContext.Provider value={resolved}>
      {children}
    </VisitorGeoContext.Provider>
  );
}

export function useVisitorGeoCountry(): string | null {
  return useContext(VisitorGeoContext);
}

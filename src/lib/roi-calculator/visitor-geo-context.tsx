"use client";

import { createContext, useContext, type ReactNode } from "react";

const VisitorGeoContext = createContext<string | null>(null);

export function VisitorGeoProvider({
  country,
  children,
}: {
  country: string | null;
  children: ReactNode;
}) {
  return (
    <VisitorGeoContext.Provider value={country}>
      {children}
    </VisitorGeoContext.Provider>
  );
}

export function useVisitorGeoCountry(): string | null {
  return useContext(VisitorGeoContext);
}

import type { Metadata } from "next";

/** Prevent soft-404 recovery pages from being indexed. */
export const RECOVERY_NOT_FOUND_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: true,
};

export function recoveryNotFoundMetadata(
  overrides?: Partial<Metadata>
): Metadata {
  return {
    title: "Page Not Found - Taypro",
    description: "The requested page could not be found.",
    robots: RECOVERY_NOT_FOUND_ROBOTS,
    alternates: {
      canonical: undefined,
      languages: undefined,
    },
    ...overrides,
  };
}

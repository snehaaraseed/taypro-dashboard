import "server-only";

import type { CategoryPulseMetrics } from "@/lib/insights/category-pulse-data";
import {
  assessReadability,
  type ReadabilityMetrics,
} from "@/lib/seo/readability";

const REQUIRED_H2 = [
  "Overview",
  "Query movement",
  "Landing page movement",
  "Striking distance",
  "Recommended actions",
  "Methodology note",
] as const;

function extractNumbersFromHtml(html: string): number[] {
  const stripped = html.replace(/<[^>]+>/g, " ");
  const matches = stripped.match(/-?\d+(?:\.\d+)?/g) ?? [];
  return matches.map((m) => Number.parseFloat(m)).filter(Number.isFinite);
}

function numberMatchesAllowed(value: number, allowed: number[]): boolean {
  if (allowed.includes(value)) return true;
  const rounded = Math.round(value);
  if (allowed.includes(rounded)) return true;
  const one = Math.round(value * 10) / 10;
  if (allowed.includes(one)) return true;
  const two = Math.round(value * 100) / 100;
  if (allowed.includes(two)) return true;
  return false;
}

export type CategoryPulseValidationResult =
  | {
      ok: true;
      warnings?: string[];
      readability?: ReadabilityMetrics;
    }
  | {
      ok: false;
      errors: string[];
      warnings?: string[];
      readability?: ReadabilityMetrics;
    };

export function validateCategoryPulseContent(
  content: string,
  metrics: CategoryPulseMetrics
): CategoryPulseValidationResult {
  const errors: string[] = [];
  const readability = assessReadability(content);
  const warnings = readability.warnings;
  errors.push(...readability.blockers);

  for (const heading of REQUIRED_H2) {
    if (!content.includes(`<h2>${heading}</h2>`)) {
      errors.push(`Missing required section: ${heading}`);
    }
  }

  if (!content.includes("<table")) {
    errors.push("Missing query or page data table");
  }

  if (metrics.recommendedActions.length > 0 && !content.includes("<ol>")) {
    errors.push("Missing recommended actions list");
  }

  const proseNumbers = extractNumbersFromHtml(content);
  const allowed = new Set(metrics.allowedNumbers);
  const suspicious: number[] = [];

  for (const n of proseNumbers) {
    if (n >= 1900 && n <= 2100) continue;
    if (allowed.has(n)) continue;
    if (numberMatchesAllowed(n, metrics.allowedNumbers)) continue;
    if (Math.abs(n) <= 1 && metrics.allowedNumbers.some((a) => Math.abs(a - n) < 0.15)) {
      continue;
    }
    suspicious.push(n);
  }

  const uniqueSuspicious = [...new Set(suspicious)].slice(0, 5);
  if (uniqueSuspicious.length > 0) {
    errors.push(
      `Numeric values not in metrics bundle: ${uniqueSuspicious.join(", ")}`
    );
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
      warnings,
      readability: readability.metrics,
    };
  }
  return { ok: true, warnings, readability: readability.metrics };
}

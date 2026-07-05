import "server-only";

import type { GeneratedPressRelease } from "@/lib/press/press-release-generator";
import { stripLeakedPressInstructions } from "@/lib/press/press-release-generator";
import type { ProductKnowledgeFocus } from "@/lib/productKnowledge";

export type PressValidationResult = {
  ok: boolean;
  errors: string[];
};

const PLACEHOLDER_PATTERNS = [
  /\[TBD\]/i,
  /\[INSERT/i,
  /lorem ipsum/i,
  /XX%/,
  /TODO:/i,
  /PLACEHOLDER/i,
];

export const PRESS_RELEASE_MIN_BODY_WORDS = 250;

export function countPressReleaseWords(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

function countWords(html: string): number {
  return countPressReleaseWords(html);
}

export function validatePressReleaseContent(
  release: GeneratedPressRelease,
  options?: { productFocus?: ProductKnowledgeFocus[] }
): PressValidationResult {
  const errors: string[] = [];

  if (!release.title?.trim()) {
    errors.push("Missing headline (title)");
  } else if (release.title.length > 120) {
    errors.push("Headline exceeds 120 characters");
  }

  if (!release.dateline?.trim()) {
    errors.push("Missing dateline");
  }

  if (!release.subhead?.trim()) {
    errors.push("Missing subhead");
  }

  const wordCount = countWords(release.content);
  if (wordCount < PRESS_RELEASE_MIN_BODY_WORDS) {
    errors.push(
      `Body too short (${wordCount} words; minimum ${PRESS_RELEASE_MIN_BODY_WORDS})`
    );
  }

  if (!release.boilerplate?.trim()) {
    errors.push("Missing boilerplate");
  }

  if (!release.contact?.email?.trim()) {
    errors.push("Missing contact email");
  }

  if (!release.contact?.name?.trim()) {
    errors.push("Missing contact name");
  }

  if (/<h1[\s>]/i.test(release.content)) {
    errors.push("Body must not contain H1 tags");
  }

  if (
    /<\s*script\b/i.test(release.content) ||
    /\bon\w+\s*=/i.test(release.content) ||
    /javascript\s*:/i.test(release.content)
  ) {
    errors.push("Body contains disallowed HTML (scripts or event handlers)");
  }

  const combined = [
    release.title,
    release.subhead,
    release.content,
    release.boilerplate,
  ].join(" ");

  const cleanedContent = stripLeakedPressInstructions(release.content);
  if (cleanedContent !== release.content.trim()) {
    errors.push("Body contains internal editor instructions — remove meta-guidance from published copy");
  }

  for (const pattern of [
    /do not call it mds/i,
    /official product name for the row-transfer/i,
    /editor notes/i,
  ]) {
    if (pattern.test(combined)) {
      errors.push("Body contains internal naming or editor instructions");
      break;
    }
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(combined)) {
      errors.push(`Placeholder text detected (${pattern})`);
      break;
    }
  }

  if (!release.quotes?.length) {
    errors.push("At least one executive quote is required");
  }

  if (options?.productFocus?.includes("cradyl")) {
    const namingText = combined.toLowerCase();
    if (/\bmds\b/.test(namingText)) {
      errors.push('Use product name CRADYL, not abbreviation "MDS"');
    }
    if (
      /movable docking station/i.test(combined) &&
      !/\bcradyl\b/i.test(combined)
    ) {
      errors.push(
        'Use official product name CRADYL (not generic "Movable Docking Station" alone)'
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

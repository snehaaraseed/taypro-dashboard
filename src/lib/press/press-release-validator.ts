import "server-only";

import type { GeneratedPressRelease } from "@/lib/press/press-release-generator";

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

function countWords(html: string): number {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

export function validatePressReleaseContent(
  release: GeneratedPressRelease
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
  if (wordCount < 250) {
    errors.push(`Body too short (${wordCount} words; minimum 250)`);
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

  const combined = [
    release.title,
    release.subhead,
    release.content,
    release.boilerplate,
  ].join(" ");

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(combined)) {
      errors.push(`Placeholder text detected (${pattern})`);
      break;
    }
  }

  if (!release.quotes?.length) {
    errors.push("At least one executive quote is required");
  }

  return { ok: errors.length === 0, errors };
}

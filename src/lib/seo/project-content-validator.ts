import "server-only";

import { extractH2Headings, stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { findInlineImgAltIssue } from "@/lib/seo/blog-body-hygiene";

export class ProjectContentValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(
      `Project structure validation failed: ${issues.slice(0, 6).join("; ")}${issues.length > 6 ? ` (+${issues.length - 6} more)` : ""}`
    );
    this.name = "ProjectContentValidationError";
    this.issues = issues;
  }
}

export type ProjectContentValidationInput = {
  title: string;
  description: string;
  content: string;
  details: string[];
};

const MIN_PROJECT_WORDS = 900;
const MIN_H2 = 4;
const MAX_H2 = 10;

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function validateGeneratedProject(
  input: ProjectContentValidationInput
): { ok: true } | { ok: false; issues: string[] } {
  const issues: string[] = [];
  const plain = stripHtmlToPlainText(input.content);
  const wordCount = countWords(plain);

  if (wordCount < MIN_PROJECT_WORDS) {
    issues.push(
      `Case study body too short (${wordCount} words; need ≥${MIN_PROJECT_WORDS})`
    );
  }

  const titleLen = input.title.trim().length;
  if (titleLen < 20 || titleLen > 90) {
    issues.push(`Title length ${titleLen} chars (target 40–80, allow 20–90)`);
  }

  const descLen = input.description.trim().length;
  if (descLen < 120 || descLen > 170) {
    issues.push(
      `Meta description ${descLen} chars (target 140–160, allow 120–170)`
    );
  }

  const h2s = extractH2Headings(input.content);
  if (h2s.length < MIN_H2) {
    issues.push(`Need ≥${MIN_H2} H2 sections (found ${h2s.length})`);
  }
  if (h2s.length > MAX_H2) {
    issues.push(`Too many H2 sections (${h2s.length}; max ${MAX_H2})`);
  }

  if (/<h1\b/i.test(input.content)) {
    issues.push("Body must not contain <h1>");
  }

  const imgAltIssue = findInlineImgAltIssue(input.content);
  if (imgAltIssue) {
    issues.push(imgAltIssue);
  }

  if (input.details.length < 4) {
    issues.push(`Need ≥4 overview detail chips (found ${input.details.length})`);
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true };
}

export function assertGeneratedProjectValid(
  input: ProjectContentValidationInput
): void {
  const result = validateGeneratedProject(input);
  if (!result.ok) {
    throw new ProjectContentValidationError(result.issues);
  }
}

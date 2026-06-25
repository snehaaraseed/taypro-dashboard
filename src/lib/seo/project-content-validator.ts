import "server-only";

import type { ProjectEditorialStatus, ProjectFactsJson } from "@/lib/cms/project-facts-types";
import { assertFactsReflectedInContent } from "@/lib/cms/project-facts";
import { extractH2Headings, stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { findInlineImgAltIssue } from "@/lib/seo/blog-body-hygiene";
import { resolveProjectWordCountPolicy } from "@/lib/seo/project-content-outline";
import { SERP_DESCRIPTION_MAX } from "@/lib/seo/serp-description";

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
  facts?: ProjectFactsJson | null;
  editorialStatus?: ProjectEditorialStatus | null;
  slug?: string;
  seoKeyword?: string | null;
  previousWordCount?: number;
  allowShrink?: boolean;
};

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function hasDuplicateH2(h2s: string[]): string | null {
  const seen = new Set<string>();
  for (const h of h2s) {
    const key = h.trim().toLowerCase();
    if (seen.has(key)) return h;
    seen.add(key);
  }
  return null;
}

export function validateGeneratedProject(
  input: ProjectContentValidationInput
): { ok: true } | { ok: false; issues: string[] } {
  const issues: string[] = [];
  const policy = resolveProjectWordCountPolicy(
    input.facts,
    input.editorialStatus,
    input.slug
  );
  const plain = stripHtmlToPlainText(input.content);
  const wordCount = countWords(plain);

  if (wordCount < policy.publishMin) {
    issues.push(
      `Case study too short (${wordCount} words; tier ${policy.tier} needs ≥${policy.publishMin})`
    );
  }
  if (wordCount > policy.publishMax) {
    issues.push(
      `Case study too long (${wordCount} words; tier ${policy.tier} max ${policy.publishMax})`
    );
  }

  if (
    input.previousWordCount &&
    !input.allowShrink &&
    wordCount < input.previousWordCount * 0.9 &&
    wordCount < policy.publishMin
  ) {
    issues.push(
      `Improve mode dropped word count too far (${wordCount} vs ${input.previousWordCount} before)`
    );
  }

  const titleLen = input.title.trim().length;
  if (titleLen < 20 || titleLen > 90) {
    issues.push(`Title length ${titleLen} chars (target 40–80, allow 20–90)`);
  }

  const descLen = input.description.trim().length;
  if (descLen < 120 || descLen > SERP_DESCRIPTION_MAX) {
    issues.push(
      `Meta description ${descLen} chars (target 140–155, allow 120–${SERP_DESCRIPTION_MAX})`
    );
  }

  const h2s = extractH2Headings(input.content);
  if (h2s.length < policy.h2Min) {
    issues.push(`Need ≥${policy.h2Min} H2 sections (found ${h2s.length})`);
  }
  if (h2s.length > policy.h2Max) {
    issues.push(`Too many H2 sections (${h2s.length}; max ${policy.h2Max})`);
  }

  const dup = hasDuplicateH2(h2s);
  if (dup) {
    issues.push(`Duplicate H2 heading: "${dup}"`);
  }

  if (!/<table\b/i.test(input.content)) {
    issues.push("Missing site statistics <table>");
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

  if (input.facts) {
    issues.push(...assertFactsReflectedInContent(input.facts, input.content));
  }

  if (input.seoKeyword?.trim()) {
    const kw = input.seoKeyword.trim().toLowerCase();
    const opening = plain.slice(0, 600).toLowerCase();
    if (!opening.includes(kw)) {
      issues.push(`Primary keyword "${input.seoKeyword}" not in opening content`);
    }
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

export function auditProjectWordStats(
  content: string,
  facts?: ProjectFactsJson | null,
  editorialStatus?: ProjectEditorialStatus | null,
  slug?: string
): {
  wordCount: number;
  narrativeWords: number;
  h2Count: number;
  policy: ReturnType<typeof resolveProjectWordCountPolicy>;
} {
  const policy = resolveProjectWordCountPolicy(facts, editorialStatus, slug);
  const plain = stripHtmlToPlainText(content);
  return {
    wordCount: countWords(plain),
    narrativeWords: 0,
    h2Count: extractH2Headings(content).length,
    policy,
  };
}

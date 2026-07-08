import "server-only";

import type { ProjectEditorialStatus, ProjectFactsJson } from "@/lib/cms/project-facts-types";
import { assertFactsReflectedInContent } from "@/lib/cms/project-facts";
import { extractH2Headings, stripHtmlToPlainText } from "@/lib/seo/blog-similarity";
import { findInlineImgAltIssue } from "@/lib/seo/blog-body-hygiene";
import { resolveProjectWordCountPolicy } from "@/lib/seo/project-content-outline";
import {
  assessReadability,
  type ReadabilityMetrics,
} from "@/lib/seo/readability";

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

export type ProjectContentValidationResult =
  | {
      ok: true;
      warnings?: string[];
      readability?: ReadabilityMetrics;
    }
  | {
      ok: false;
      issues: string[];
      warnings?: string[];
      readability?: ReadabilityMetrics;
    };

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Detects leaked AI planning/reasoning scaffolding that must never be published
 * (markdown bullets, "Drafting/Revised" notes, word-count checks, echoed prompt
 * rules, or leftover output-format sentinels).
 */
const LEAKED_REASONING_PATTERNS: RegExp[] = [
  /^\s*\*\s{2,}\S/m,
  /\bDrafting\s+(?:P\d|Para|Paragraph)\b/i,
  /\bRevised\s+(?:P\d|Para|Paragraph|Section|Text|Checklist)\b/i,
  /\bWord\s*count\s*(?:check)?\b/i,
  /\bSelf[-\s]?correction\b/i,
  /\bReturn ONLY the HTML\b/i,
  /={3}\s*HTML\s*={3}/i,
  /={3}\s*END\s*={3}/i,
  /^\s*\d+\s*[–-]\s*\d+\s*words\b/im,
  /^\s*HTML fragment\.?\s*$/im,
  /`<\/?[a-z][^`]*>`/i,
];

export function findLeakedReasoningArtifact(content: string): string | null {
  for (const re of LEAKED_REASONING_PATTERNS) {
    const match = content.match(re);
    if (match) {
      return match[0].trim().slice(0, 80);
    }
  }
  return null;
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

function numberValue(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isAutomaticProject(input: ProjectContentValidationInput): boolean {
  const detailTags = input.details.map((d) => d.trim().toLowerCase());
  const detailText = detailTags.join(" ");
  const cleaningMode = input.facts?.cleaningMode?.toLowerCase() ?? "";
  const automaticRobots = numberValue(input.facts?.automaticRobots);
  const semiAutomaticRobots = numberValue(input.facts?.semiAutomaticRobots);
  const hasSemiCategory = detailTags.includes("semi-automatic");
  const hasAutomaticCategory = detailTags.includes("automatic");
  const hasAutomaticRobotCount = /\b[1-9]\d*\s+auto(?:matic)?\s+robots?\b/i.test(
    detailText
  );

  if (hasSemiCategory && automaticRobots === 0) return false;
  if (/semi/.test(cleaningMode) && automaticRobots === 0) return false;
  if (semiAutomaticRobots > 0 && automaticRobots === 0) return false;

  return (
    automaticRobots > 0 ||
    hasAutomaticCategory ||
    hasAutomaticRobotCount ||
    /\b(glyde|glyde-x)\b/i.test(cleaningMode) ||
    (/\bfully\s+automatic\b/.test(cleaningMode) && semiAutomaticRobots === 0)
  );
}

function hasMonthlyPickAndPlaceCadenceLanguage(text: string): boolean {
  return (
    /\b3\s*[–-]\s*10\b[\s\S]{0,80}\b(?:cycles?|dry cycles?|cleaning cycles?)\b[\s\S]{0,80}\b(?:month|monthly)\b/i.test(text) ||
    /\b(?:roughly|about|commonly)\s+3\s*[–-]\s*10\s+dry cycles?\s+per month\b/i.test(text) ||
    /\bnot daily washing of every module\b/i.test(text)
  );
}

export function validateGeneratedProject(
  input: ProjectContentValidationInput
): ProjectContentValidationResult {
  const issues: string[] = [];
  const policy = resolveProjectWordCountPolicy(
    input.facts,
    input.editorialStatus,
    input.slug
  );
  const plain = stripHtmlToPlainText(input.content);
  const wordCount = countWords(plain);
  const readability = assessReadability(input.content);
  const warnings = readability.warnings;
  issues.push(...readability.blockers);

  if (wordCount < policy.publishMin) {
    issues.push(
      `Case study too short (${wordCount} words; tier ${policy.tier} needs ≥${policy.publishMin})`
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
  if (titleLen < 20 || titleLen > 130) {
    issues.push(`Title length ${titleLen} chars (target 40–80, allow 20–130)`);
  }

  const descLen = input.description.trim().length;
  if (descLen < 120) {
    issues.push(`Meta description ${descLen} chars (minimum 120)`);
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

  const leaked = findLeakedReasoningArtifact(input.content);
  if (leaked) {
    issues.push(`Content contains leaked AI reasoning/scaffolding: "${leaked}"`);
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

  if (isAutomaticProject(input) && hasMonthlyPickAndPlaceCadenceLanguage(plain)) {
    issues.push(
      "Automatic robot project uses pick-and-place cadence language (3–10 monthly cycles / not daily). Use daily waterless cleaning cycles for automatic rows."
    );
  }

  if (input.seoKeyword?.trim()) {
    const kw = input.seoKeyword.trim().toLowerCase();
    const opening = plain.slice(0, 600).toLowerCase();
    if (!opening.includes(kw)) {
      issues.push(`Primary keyword "${input.seoKeyword}" not in opening content`);
    }
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
      warnings,
      readability: readability.metrics,
    };
  }
  return { ok: true, warnings, readability: readability.metrics };
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

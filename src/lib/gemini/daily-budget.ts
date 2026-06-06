import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

/** Why a Gemini generateContent call was made (for daily accounting). */
export type GeminiCallPurpose =
  | "blog_topic"
  | "blog_keyword"
  | "blog_plan"
  | "blog_section"
  | "blog_faq"
  | "blog_expand"
  | "blog_repair"
  | "blog_image"
  | "serp_research"
  | "serp_facts"
  | "translation"
  | "gsc"
  | "other";

export type GeminiDailyBudgetSnapshot = {
  date: string;
  totalCalls: number;
  blogCalls: number;
  translationCalls: number;
  byPurpose: Record<string, number>;
  limits: {
    dailyRpd: number;
    blogMax: number;
    translationReserve: number;
  };
};

const BLOG_PURPOSES = new Set<GeminiCallPurpose>([
  "blog_topic",
  "blog_keyword",
  "blog_plan",
  "blog_section",
  "blog_faq",
  "blog_expand",
  "blog_repair",
  "blog_image",
]);

const SERP_PURPOSES = new Set<GeminiCallPurpose>(["serp_research", "serp_facts"]);

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getGeminiDailyRpdLimit(): number {
  return envInt("GEMINI_DAILY_RPD_LIMIT", 500);
}

/** Max Gemini calls for the English blog writer in one day (incl. retries). */
export function getBlogPipelineMaxCalls(): number {
  return envInt("BLOG_PIPELINE_MAX_GEMINI_CALLS", 100);
}

/** Calls reserved for evening blog translations (5–10 blogs × ~8 calls). */
export function getTranslationReserveCalls(): number {
  return envInt("GEMINI_TRANSLATION_RESERVE", 100);
}

/** Max grounded SERP + fact calls per blog pipeline run. */
export function getSerpMaxCallsPerBlog(): number {
  return envInt("GEMINI_SERP_MAX_CALLS_PER_BLOG", 2);
}

/** Call before each grounded generateContent (SERP or facts). */
export function assertSerpCallAllowed(
  purpose: "serp_research" | "serp_facts",
  callsSoFarThisRun: number
): void {
  if (!SERP_PURPOSES.has(purpose)) {
    throw new Error(`Invalid SERP purpose: ${purpose}`);
  }
  const max = getSerpMaxCallsPerBlog();
  if (callsSoFarThisRun >= max) {
    const snapshot = getGeminiDailyBudget();
    throw new GeminiDailyBudgetError(
      `Grounded research cap reached for this blog (${callsSoFarThisRun}/${max} calls). Set GEMINI_SERP_MAX_CALLS_PER_BLOG to allow more.`,
      snapshot
    );
  }
  assertGeminiCallAllowed(purpose);
}

function budgetDir(): string {
  return path.join(getDeploymentRoot(), ".runtime", "gemini-budget");
}

function budgetFileForDate(date: string): string {
  return path.join(budgetDir(), `${date}.json`);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

type BudgetFile = {
  date: string;
  totalCalls: number;
  blogCalls: number;
  translationCalls: number;
  byPurpose: Record<string, number>;
};

function emptyBudget(date: string): BudgetFile {
  return {
    date,
    totalCalls: 0,
    blogCalls: 0,
    translationCalls: 0,
    byPurpose: {},
  };
}

function readBudgetFile(date: string): BudgetFile {
  const file = budgetFileForDate(date);
  if (!fs.existsSync(file)) return emptyBudget(date);
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as BudgetFile;
    if (raw.date !== date) return emptyBudget(date);
    return raw;
  } catch {
    return emptyBudget(date);
  }
}

function writeBudgetFile(budget: BudgetFile): void {
  fs.mkdirSync(budgetDir(), { recursive: true });
  fs.writeFileSync(budgetFileForDate(budget.date), JSON.stringify(budget, null, 2));
}

export function getGeminiDailyBudget(): GeminiDailyBudgetSnapshot {
  const date = todayUtc();
  const budget = readBudgetFile(date);
  return {
    date,
    totalCalls: budget.totalCalls,
    blogCalls: budget.blogCalls,
    translationCalls: budget.translationCalls,
    byPurpose: { ...budget.byPurpose },
    limits: {
      dailyRpd: getGeminiDailyRpdLimit(),
      blogMax: getBlogPipelineMaxCalls(),
      translationReserve: getTranslationReserveCalls(),
    },
  };
}

export class GeminiDailyBudgetError extends Error {
  readonly snapshot: GeminiDailyBudgetSnapshot;

  constructor(message: string, snapshot: GeminiDailyBudgetSnapshot) {
    super(message);
    this.name = "GeminiDailyBudgetError";
    this.snapshot = snapshot;
  }
}

/** Call immediately before generateContent. */
export function assertGeminiCallAllowed(purpose: GeminiCallPurpose): void {
  const snapshot = getGeminiDailyBudget();
  const { totalCalls, blogCalls, translationCalls } = snapshot;
  const dailyLimit = snapshot.limits.dailyRpd;
  const blogMax = snapshot.limits.blogMax;
  const translationReserve = snapshot.limits.translationReserve;

  if (totalCalls >= dailyLimit) {
    throw new GeminiDailyBudgetError(
      `Gemini daily limit reached (${totalCalls}/${dailyLimit} RPD). Try again after UTC midnight.`,
      snapshot
    );
  }

  if (BLOG_PURPOSES.has(purpose) && blogCalls >= blogMax) {
    throw new GeminiDailyBudgetError(
      `Blog pipeline Gemini budget exhausted (${blogCalls}/${blogMax} calls today).`,
      snapshot
    );
  }

  if (purpose === "translation") {
    const headroom = dailyLimit - translationReserve;
    if (totalCalls >= headroom) {
      throw new GeminiDailyBudgetError(
        `Translation reserve reached (${totalCalls}/${headroom} non-reserved RPD used).`,
        snapshot
      );
    }
  }
}

/** Call after a successful generateContent. */
export function recordGeminiCall(purpose: GeminiCallPurpose): GeminiDailyBudgetSnapshot {
  const date = todayUtc();
  const budget = readBudgetFile(date);
  budget.totalCalls += 1;
  budget.byPurpose[purpose] = (budget.byPurpose[purpose] ?? 0) + 1;
  if (BLOG_PURPOSES.has(purpose)) {
    budget.blogCalls += 1;
  }
  if (purpose === "translation") {
    budget.translationCalls += 1;
  }
  writeBudgetFile(budget);
  return getGeminiDailyBudget();
}

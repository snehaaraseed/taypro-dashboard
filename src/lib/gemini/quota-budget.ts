import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { getGeminiKeyPoolSize } from "@/lib/gemini/api-keys";

const DEFAULT_GEMMA_RPD_PER_KEY = 1500;
const DEFAULT_GROUNDING_RPD_PER_KEY = 20;
const DEFAULT_RESERVED_GROUNDING = 2;

export type QuotaBudgetScope = "blog" | "burn" | "grounding" | "insight" | "press";

export type DailyQuotaUsage = {
  date: string;
  gemma: number;
  grounding: number;
  blogReservedUsed: number;
};

function todayYmd(): string {
  const tz = process.env.BLOG_CRON_TZ?.trim() || "Asia/Kolkata";
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

function usagePath(): string {
  return path.join(getDeploymentRoot(), ".runtime", "quota-burn", "daily-usage.json");
}

function doneFilePath(): string {
  const day = todayYmd().replace(/-/g, "");
  return path.join(getDeploymentRoot(), ".runtime", "blog-cron", `done-${day}`);
}

export function isTodayBlogDone(): boolean {
  return fs.existsSync(doneFilePath());
}

export function getGemmaRpdCap(): number {
  return getGeminiKeyPoolSize() * DEFAULT_GEMMA_RPD_PER_KEY;
}

export function getGroundingRpdCap(): number {
  return getGeminiKeyPoolSize() * DEFAULT_GROUNDING_RPD_PER_KEY;
}

export function loadDailyQuotaUsage(): DailyQuotaUsage {
  const day = todayYmd();
  const filePath = usagePath();
  if (!fs.existsSync(filePath)) {
    return { date: day, gemma: 0, grounding: 0, blogReservedUsed: 0 };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as DailyQuotaUsage;
    if (raw.date !== day) {
      return { date: day, gemma: 0, grounding: 0, blogReservedUsed: 0 };
    }
    return {
      date: day,
      gemma: raw.gemma ?? 0,
      grounding: raw.grounding ?? 0,
      blogReservedUsed: raw.blogReservedUsed ?? 0,
    };
  } catch {
    return { date: day, gemma: 0, grounding: 0, blogReservedUsed: 0 };
  }
}

function saveDailyQuotaUsage(usage: DailyQuotaUsage): void {
  const dir = path.dirname(usagePath());
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(usagePath(), JSON.stringify(usage, null, 2));
}

export function assertQuotaBudgetAllowed(scope: QuotaBudgetScope): void {
  const usage = loadDailyQuotaUsage();
  const cap = scope === "grounding" ? getGroundingRpdCap() : getGemmaRpdCap();

  if (scope === "grounding") {
    if (usage.grounding >= DEFAULT_RESERVED_GROUNDING * getGeminiKeyPoolSize() + 18) {
      throw new Error("Grounding daily budget exhausted for blog automation");
    }
    return;
  }

  // Monthly insight reports and admin press releases are not gated on daily blog.
  if (scope === "insight" || scope === "press") {
    if (usage.gemma >= cap) {
      throw new Error("Gemma daily text quota exhausted on all configured keys");
    }
    return;
  }

  if (scope === "burn" && !isTodayBlogDone()) {
    throw new Error("Burn scope blocked until today's English blog is done");
  }

  if (usage.gemma >= cap) {
    throw new Error("Gemma daily text quota exhausted on all configured keys");
  }
}

export function recordQuotaUsage(scope: QuotaBudgetScope): void {
  const usage = loadDailyQuotaUsage();
  if (scope === "grounding") {
    usage.grounding += 1;
  } else {
    usage.gemma += 1;
    if (scope === "blog") {
      usage.blogReservedUsed += 1;
    }
  }
  saveDailyQuotaUsage(usage);
}

export function getQuotaBudgetSummary(): {
  gemmaUsed: number;
  gemmaCap: number;
  groundingUsed: number;
  blogDone: boolean;
  keyPoolSize: number;
} {
  const usage = loadDailyQuotaUsage();
  return {
    gemmaUsed: usage.gemma,
    gemmaCap: getGemmaRpdCap(),
    groundingUsed: usage.grounding,
    blogDone: isTodayBlogDone(),
    keyPoolSize: getGeminiKeyPoolSize(),
  };
}

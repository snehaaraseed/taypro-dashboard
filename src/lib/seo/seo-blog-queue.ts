import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

let cachedQueue: string[] | null = null;

function resolveQueuePath(): string {
  const envPath = process.env.SEO_BLOG_QUEUE_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "seo-blog-queue.json");
}

/** Priority-ordered keywords from data/seo-blog-queue.json (Tier B calendar). */
export function loadSeoBlogQueueKeywords(): string[] {
  if (cachedQueue) return cachedQueue;

  const filePath = resolveQueuePath();
  if (!fs.existsSync(filePath)) {
    cachedQueue = [];
    return cachedQueue;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      keywords?: unknown;
    };
    const list = Array.isArray(raw.keywords) ? raw.keywords : [];
    cachedQueue = list
      .map((k) => (typeof k === "string" ? k.trim().toLowerCase() : ""))
      .filter(Boolean);
  } catch {
    cachedQueue = [];
  }

  return cachedQueue;
}

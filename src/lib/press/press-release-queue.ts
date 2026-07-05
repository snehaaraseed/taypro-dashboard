import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

import type { ProductKnowledgeFocus } from "@/lib/productKnowledge";

export type PressQueueAngle =
  | "product_launch"
  | "milestone"
  | "award"
  | "partnership"
  | "deployment";

export type PressQueueItem = {
  id: string;
  angle: PressQueueAngle;
  titleHint: string;
  summary: string;
  facts: string[];
  quoteAttribution: string;
  /** Optional product IDs for focused knowledge (e.g. cradyl, glyde). */
  productFocus?: ProductKnowledgeFocus[];
  status: "pending" | "done" | "skipped";
};

type PressQueueFile = {
  items: PressQueueItem[];
};

function resolveQueuePath(): string {
  const envPath = process.env.PRESS_RELEASE_QUEUE_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "press-release-queue.json");
}

function readQueueFile(): PressQueueFile {
  const filePath = resolveQueuePath();
  if (!fs.existsSync(filePath)) {
    return { items: [] };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as PressQueueFile;
    return { items: Array.isArray(raw.items) ? raw.items : [] };
  } catch {
    return { items: [] };
  }
}

function writeQueueFile(data: PressQueueFile): void {
  const filePath = resolveQueuePath();
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function loadPressReleaseQueue(): PressQueueItem[] {
  return readQueueFile().items;
}

export function getNextPendingQueueItem(): PressQueueItem | null {
  return loadPressReleaseQueue().find((i) => i.status === "pending") ?? null;
}

export function getQueueItemById(id: string): PressQueueItem | null {
  return loadPressReleaseQueue().find((i) => i.id === id) ?? null;
}

export function markQueueItemDone(id: string): void {
  const data = readQueueFile();
  const item = data.items.find((i) => i.id === id);
  if (item) item.status = "done";
  writeQueueFile(data);
}

export function countPendingQueueItems(): number {
  return loadPressReleaseQueue().filter((i) => i.status === "pending").length;
}

function slugifyQueueId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function uniqueQueueId(base: string): string {
  const data = readQueueFile();
  let candidate = base;
  let n = 2;
  while (data.items.some((i) => i.id === candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export type CreatePressQueueInput = {
  id?: string;
  angle: PressQueueAngle;
  titleHint: string;
  summary: string;
  facts: string[];
  quoteAttribution?: string;
  productFocus?: ProductKnowledgeFocus[];
};

export function addPressQueueItem(
  input: CreatePressQueueInput
): { success: boolean; item?: PressQueueItem; error?: string } {
  const titleHint = input.titleHint.trim();
  const summary = input.summary.trim();
  const facts = input.facts.map((f) => f.trim()).filter(Boolean);

  if (!titleHint) {
    return { success: false, error: "Title hint is required" };
  }
  if (!summary) {
    return { success: false, error: "Summary is required" };
  }
  if (facts.length === 0) {
    return { success: false, error: "At least one verified fact is required" };
  }

  const baseId = slugifyQueueId(input.id?.trim() || titleHint);
  if (!baseId) {
    return { success: false, error: "Could not derive a valid queue id" };
  }

  const data = readQueueFile();
  const id = uniqueQueueId(baseId);
  const item: PressQueueItem = {
    id,
    angle: input.angle,
    titleHint,
    summary,
    facts,
    quoteAttribution:
      input.quoteAttribution?.trim() ||
      "Yogesh Kudale, Co-Founder & CEO, Taypro",
    productFocus: input.productFocus?.length ? input.productFocus : undefined,
    status: "pending",
  };

  data.items.push(item);
  writeQueueFile(data);
  return { success: true, item };
}

export function updatePressQueueItem(
  id: string,
  updates: Partial<
    Pick<
      PressQueueItem,
      "angle" | "titleHint" | "summary" | "facts" | "quoteAttribution" | "productFocus" | "status"
    >
  >
): { success: boolean; item?: PressQueueItem; error?: string } {
  const data = readQueueFile();
  const item = data.items.find((i) => i.id === id);
  if (!item) {
    return { success: false, error: "Queue item not found" };
  }

  if (updates.titleHint !== undefined) {
    const titleHint = updates.titleHint.trim();
    if (!titleHint) return { success: false, error: "Title hint cannot be empty" };
    item.titleHint = titleHint;
  }
  if (updates.summary !== undefined) {
    const summary = updates.summary.trim();
    if (!summary) return { success: false, error: "Summary cannot be empty" };
    item.summary = summary;
  }
  if (updates.facts !== undefined) {
    const facts = updates.facts.map((f) => f.trim()).filter(Boolean);
    if (facts.length === 0) {
      return { success: false, error: "At least one verified fact is required" };
    }
    item.facts = facts;
  }
  if (updates.angle !== undefined) item.angle = updates.angle;
  if (updates.quoteAttribution !== undefined) {
    item.quoteAttribution = updates.quoteAttribution.trim();
  }
  if (updates.productFocus !== undefined) {
    item.productFocus = updates.productFocus.length ? updates.productFocus : undefined;
  }
  if (updates.status !== undefined) item.status = updates.status;

  writeQueueFile(data);
  return { success: true, item };
}

export function deletePressQueueItem(
  id: string
): { success: boolean; error?: string } {
  const data = readQueueFile();
  const before = data.items.length;
  data.items = data.items.filter((i) => i.id !== id);
  if (data.items.length === before) {
    return { success: false, error: "Queue item not found" };
  }
  writeQueueFile(data);
  return { success: true };
}

export function requeuePressQueueItem(
  id: string
): { success: boolean; item?: PressQueueItem; error?: string } {
  return updatePressQueueItem(id, { status: "pending" });
}

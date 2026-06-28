import "server-only";

import { and, eq, isNotNull } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import { getDb } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { SOURCE_LOCALE } from "@/lib/translation/config";

const POOL_PATH = path.join(
  getDeploymentRoot(),
  "data",
  "project-star-codenames.json"
);

type StarPoolFile = {
  names: string[];
};

let cachedPool: string[] | null = null;

function loadStarPool(): string[] {
  if (cachedPool) return cachedPool;
  if (!fs.existsSync(POOL_PATH)) {
    throw new Error(
      `Star codename pool missing at ${POOL_PATH}. Run: node scripts/generate-star-codenames.mjs`
    );
  }
  const parsed = JSON.parse(fs.readFileSync(POOL_PATH, "utf8")) as StarPoolFile;
  if (!Array.isArray(parsed.names) || parsed.names.length === 0) {
    throw new Error("Star codename pool is empty or invalid");
  }
  cachedPool = parsed.names;
  return cachedPool;
}

/** Public card / hero / metadata title: codename + site descriptor. */
export function formatProjectDisplayTitle(
  codename: string | null | undefined,
  siteTitle: string
): string {
  const site = siteTitle.trim();
  const code = codename?.trim();
  if (!code) return site;
  if (!site) return `Project ${code}`;
  return `Project ${code}, ${site}`;
}

/** Next unused star codename from the ordered pool (English rows only). */
export async function allocateProjectCodename(): Promise<string> {
  const db = getDb();
  const usedRows = await db
    .select({ codename: projects.codename })
    .from(projects)
    .where(
      and(eq(projects.locale, SOURCE_LOCALE), isNotNull(projects.codename))
    );

  const used = new Set(
    usedRows
      .map((row) => row.codename?.trim())
      .filter((name): name is string => Boolean(name))
  );

  for (const name of loadStarPool()) {
    if (!used.has(name)) return name;
  }

  throw new Error(
    "Star codename pool exhausted. Regenerate or extend data/project-star-codenames.json"
  );
}

/** Copy codename to every locale row for a slug (e.g. after rename or backfill). */
export async function syncProjectCodenameAcrossLocales(
  slug: string,
  codename: string
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  await db
    .update(projects)
    .set({ codename, updatedAt: now })
    .where(eq(projects.slug, slug));
}

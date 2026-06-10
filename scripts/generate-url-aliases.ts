/**
 * Emit data/url-aliases.json for review (manual + auto-generated plurals).
 * Run: npm run seo:generate-url-aliases
 */
import fs from "node:fs";
import path from "node:path";
import { buildAliasMap, MANUAL_ALIASES } from "../src/lib/url-recovery/aliases";

const outPath = path.join(process.cwd(), "data/url-aliases.json");
const aliasMap = buildAliasMap();
const aliases = Object.fromEntries(aliasMap.entries());

const payload = {
  description:
    "URL alias map for Taypro smart redirects. Regenerate with npm run seo:generate-url-aliases.",
  updatedAt: new Date().toISOString(),
  manualCount: Object.keys(MANUAL_ALIASES).length,
  totalCount: Object.keys(aliases).length,
  aliases,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${Object.keys(aliases).length} aliases → ${outPath}`);

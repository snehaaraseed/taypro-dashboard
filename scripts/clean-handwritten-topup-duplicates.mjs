/**
 * Keep a single "Operations evidence summary" block per file (tier-3 top-up dedupe).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  countOperationsEvidenceBlocks,
  dedupeOperationsEvidenceSummary,
} from "./lib/dedupe-operations-evidence-summary.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(path.resolve(__dirname, ".."), "content", "handwritten-case-studies");

let cleaned = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  const fp = path.join(dir, file);
  const html = fs.readFileSync(fp, "utf8");
  const before = countOperationsEvidenceBlocks(html);
  if (before <= 1) continue;

  const next = dedupeOperationsEvidenceSummary(html);
  const after = countOperationsEvidenceBlocks(next);
  if (after !== 1) {
    console.warn(`  ⚠️  ${file}: still ${after} blocks after dedupe`);
    continue;
  }

  fs.writeFileSync(fp, next);
  cleaned++;
  console.log(`deduped ${file}: ${before} → ${after}`);
}
console.log("files cleaned:", cleaned);

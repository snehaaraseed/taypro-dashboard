/**
 * Keep a single "Operations evidence summary" block per file (tier-3 top-up dedupe).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { countWords } from "./lib/sanitize-client-names.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(path.resolve(__dirname, ".."), "content", "handwritten-case-studies");
const MIN = Number(process.env.HANDWRITTEN_MIN_WORDS || 3000);
const blockRe =
  /<h2>Operations evidence summary<\/h2>[\s\S]*?(?=<h2>Operations evidence summary<\/h2>|<h2>Conclusion<\/h2>)/g;

let cleaned = 0;
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  let html = fs.readFileSync(path.join(dir, file), "utf8");
  const matches = html.match(/<h2>Operations evidence summary<\/h2>/g);
  if (!matches || matches.length <= 1) continue;
  const first = html.indexOf("<h2>Operations evidence summary</h2>");
  const before = html.slice(0, first);
  const afterFirst = html.slice(first);
  const conclusionIdx = afterFirst.indexOf("<h2>Conclusion</h2>");
  const middle = afterFirst.slice(0, conclusionIdx);
  const rest = afterFirst.slice(conclusionIdx);
  const keptOne = middle.replace(blockRe, "");
  let next = before + keptOne + rest;
  while ((next.match(/<h2>Operations evidence summary<\/h2>/g) || []).length > 1) {
    next = next.replace(
      /<h2>Operations evidence summary<\/h2>[\s\S]*?(?=<h2>Operations evidence summary<\/h2>)/,
      ""
    );
  }
  if (countWords(next) < MIN) continue;
  fs.writeFileSync(path.join(dir, file), next);
  cleaned++;
  console.log("deduped", file, matches.length, "→", (next.match(/<h2>Operations evidence summary/g) || []).length);
}
console.log("files cleaned:", cleaned);

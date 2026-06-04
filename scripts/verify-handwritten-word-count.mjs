/**
 * Verify hand-written case studies meet minimum word count.
 * Usage: npm run cms:verify-handwritten-words
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { countWords } from "./lib/sanitize-client-names.mjs";

const MIN = Number(process.env.HANDWRITTEN_MIN_WORDS || 3000);
const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "content",
  "handwritten-case-studies"
);

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
const fails = [];

for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), "utf8");
  const w = countWords(html);
  if (w < MIN) fails.push({ file: f, words: w });
  else console.log(`OK ${f}: ${w} words`);
}

if (fails.length) {
  console.error(`\nBelow ${MIN} words:`);
  for (const x of fails) console.error(`  ${x.file}: ${x.words}`);
  process.exit(1);
}

console.log(`\nAll ${files.length} files ≥ ${MIN} words.`);

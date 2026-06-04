import fs from "fs";
import { countWords } from "./lib/sanitize-client-names.mjs";
import { supplements } from "./lib/handwritten-supplements.mjs";

const MIN = Number(process.env.HANDWRITTEN_MIN_WORDS || 3000);
const dir = "content/handwritten-case-studies";

for (const [slug, block] of Object.entries(supplements)) {
  const path = `${dir}/${slug}.html`;
  if (!fs.existsSync(path)) continue;
  let html = fs.readFileSync(path, "utf8");
  if (html.includes(block.slice(0, 40))) continue;
  if (countWords(html) >= MIN) continue;
  html = html.replace("<h2>Conclusion</h2>", `${block.trim()}\n\n<h2>Conclusion</h2>`);
  fs.writeFileSync(path, html);
  console.log(slug, "->", countWords(html));
}

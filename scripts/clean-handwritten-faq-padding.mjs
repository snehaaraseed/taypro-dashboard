/**
 * Remove mechanical FAQ padding (review-cycle duplicates, boilerplate).
 */
import fs from "fs";
import { countWords } from "./lib/sanitize-client-names.mjs";

const dir = "content/handwritten-case-studies";
const BOILER =
  /Owners should validate statistics and paths with local SCADA, tariffs, and layout drawings—see <a href="\/projects">projects<\/a>, <a href="\/solar-panel-cleaning-robot-price-calculator#calculator">calculator<\/a>, and <a href="\/performance-methodology">methodology<\/a> when building procurement packs\./g;

function stripFaqSpam(html) {
  html = html.replace(
    /<h3>[^<]*\(review cycle \d+\)[^<]*<\/h3>\s*<p>[\s\S]*?<\/p>/gi,
    ""
  );
  html = html.replace(BOILER, "");
  html = html.replace(/\bautonomic paths\b/gi, "scheduled GLYDE paths");
  html = html.replace(/\bautonomic night\b/gi, "scheduled");

  for (const title of ["Extended operations FAQ", "Operations FAQ"]) {
    const re = new RegExp(
      `<h2>${title}<\\/h2>[\\s\\S]*?(?=<h2>Conclusion<\\/h2>)`,
      "i"
    );
    if (!re.test(html) || !/review cycle/i.test(html)) continue;
    const m = html.match(re);
    if (!m) continue;
    const block = m[0];
    const h3s = [...block.matchAll(/<h3>([^<]+)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)];
    const unique = [];
    const seen = new Set();
    for (const h of h3s) {
      const t = h[1].replace(/\s*\(review cycle \d+\)/i, "").trim();
      if (seen.has(t) || /review cycle/i.test(h[1])) continue;
      seen.add(t);
      unique.push({ title: t, body: h[2].trim() });
      if (unique.length >= 3) break;
    }
    const rep = unique.length
      ? `<h2>Operations FAQ</h2>\n${unique.map((q) => `<h3>${q.title}</h3>\n<p>${q.body}</p>`).join("\n\n")}\n\n`
      : "";
    html = html.replace(re, rep);
  }

  html = html.replace(
    /<h2>Extended operations FAQ<\/h2>[\s\S]*?(?=<h2>Conclusion<\/h2>)/gi,
    (block) => (/review cycle/i.test(block) ? "" : block)
  );

  return html;
}

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  const path = `${dir}/${file}`;
  let html = fs.readFileSync(path, "utf8");
  const before = countWords(html);
  html = stripFaqSpam(html);
  fs.writeFileSync(path, html);
  const after = countWords(html);
  const rc = (html.match(/review cycle/gi) || []).length;
  if (before !== after || rc) {
    console.log(file, before, "->", after, rc ? `RC${rc}` : "");
  }
}

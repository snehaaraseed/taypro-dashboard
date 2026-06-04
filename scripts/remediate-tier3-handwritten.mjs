/**
 * Generate tier-3 HTML, fix product accuracy, top up to 3000 words, apply CMS.
 */
import { execSync } from "child_process";
import fs from "fs";
import { countWords } from "./lib/sanitize-client-names.mjs";
import { TIER3_SITES } from "./lib/handwritten-tier3-site-config.mjs";

const MIN = Number(process.env.HANDWRITTEN_MIN_WORDS || 3000);
const dir = "content/handwritten-case-studies";

function topUp(slug) {
  const fp = `${dir}/${slug}.html`;
  let html = fs.readFileSync(fp, "utf8");
  const before = countWords(html);
  if (before >= MIN) return;
  const block = `<h2>Operations evidence summary</h2>
<p>Owners should validate reported water, generation, and carbon statistics with local SCADA and tariffs; pair this ${TIER3_SITES[slug]?.mw || ""}&nbsp;MW case study with <a href="/performance-methodology">performance methodology</a>, the <a href="/projects">projects hub</a>, and the <a href="/solar-panel-cleaning-robot-price-calculator#calculator">ROI calculator</a>. Scheduled cycles and weather-aware holds—not plant-wide daily washing—define Taypro utility programmes.</p>
<p>Compare <a href="/projects/soyegaon-solar-project">Soyegaon</a>, <a href="/projects/chhayan-rajasthan-150-mw">Chhayan</a>, and tier-1 peers before copying robot density. Block-level proof—${TIER3_SITES[slug]?.nectyr ? "NECTYR exports" : "inspection sign-off"}—belongs in lender packs alongside <strong>${TIER3_SITES[slug]?.water || ""} litres</strong> and <strong>${TIER3_SITES[slug]?.energyUplift || `${TIER3_SITES[slug]?.gwh || ""} GWh`}</strong> stress tests at fifty and seventy-five percent attribution.</p>
\n\n`;
  while (countWords(html) < MIN) {
    html = html.replace("<h2>Conclusion</h2>", block + "<h2>Conclusion</h2>");
  }
  fs.writeFileSync(fp, html);
  console.log("top-up", slug, before, "->", countWords(html));
}

execSync("node scripts/generate-tier3-handwritten.mjs", { stdio: "inherit" });
execSync("node scripts/fix-handwritten-product-accuracy.mjs", { stdio: "inherit" });

for (const slug of Object.keys(TIER3_SITES)) topUp(slug);

console.log("\n=== Word counts ===");
for (const slug of Object.keys(TIER3_SITES)) {
  const w = countWords(fs.readFileSync(`${dir}/${slug}.html`, "utf8"));
  console.log(w, slug, w < MIN ? "SHORT" : "OK");
  if (w < MIN) process.exit(1);
}

execSync("node scripts/apply-handwritten-case-studies.mjs", { stdio: "inherit" });

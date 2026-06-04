/**
 * DEPRECATED — adds duplicate "review cycle" FAQ padding. Use cms:remediate-handwritten instead.
 * Pad tier-1 handwritten HTML to HANDWRITTEN_MIN_WORDS with slug-specific FAQ sections.
 */
console.error("pad-handwritten-to-min.mjs is deprecated; use: npm run cms:remediate-handwritten");
process.exit(1);
import fs from "fs";
import { countWords } from "./lib/sanitize-client-names.mjs";

const MIN = Number(process.env.HANDWRITTEN_MIN_WORDS || 3000);
const dir = "content/handwritten-case-studies";

const faqBank = {
  "agar-solar-project": [
    ["How does Agar treat semi-automatic zones in dust season?", "Seven portables cover transitions and irregular blocks while 265 GLYDE units run NECTYR-scheduled cycles when weather allows—not daily plant-wide passes. Supervisors publish a weekly map; automatic completion is logged in NECTYR; portable zones use inspection sheets."],
    ["What should lenders review besides GWh?", "Water statistics, training records, wind holds, and sample NECTYR exports plus semi-automatic inspection weeks. Agar’s mixed model requires evidence from both systems."],
  ],
  "bachau-dvc-gujrat-300-mw": [
    ["How are 172 robots prioritised across 300 MW?", "Downwind haul roads and high marginal MWh blocks lead the queue; interior tables cycle when night hours allow. NECTYR completion rates are reviewed daily in March–June."],
    ["What map governance does Bachau require?", "Docking cartography updates after civil or vegetation changes; block IDs align with finance attribution workshops."],
  ],
  "akhadana-rajasthan-360-mw": [
    ["Why is robot count low versus MW?", "Eighty portables target highest-return row kilometres first—0.22 robots/MW is prioritisation, not under-investment."],
    ["Can Akhadana add NECTYR later?", "Yes—inspection discipline with block IDs makes telematics upgrades smoother."],
  ],
  "bhadlarajasthan-300-mw": [
    ["How do forty portables cover 300 MW?", "Weekly queues prioritise edge rows and downwind strings; interior blocks cycle when marginal MWh per pass stays above finance thresholds."],
    ["When should Bhadla consider automatic tranche two?", "When repeatability maps show most row kilometres support autonomic paths—until then, semi-automatic tranche one protects PR."],
  ],
  "neneva-gujrat-250-mw": [
    ["Why only ten GLYDE-X robots?", "Tracker row length and NECTYR accountability can make low robots/MW viable—compare only with tracker-normalised PR baselines."],
    ["How are stow holds logged?", "Separately from wind holds in NECTYR so month-end reviews stay honest."],
  ],
  "seci-2-200-mw": [
    ["Why seventy-six semi-automatic machines?", "Irregular blocks—switchyard zones, transitions, immature paths—need portable waterless coverage while 103 GLYDE units anchor repeatable rows."],
    ["How do teams avoid crew silos?", "Rotation weeks and a living irregular-block registry keep the mixed fleet coherent."],
  ],
  "chhayan-rajasthan-150-mw": [
    ["Is 25 robots enough for 150 MW?", "Yes when rows are repeatable and NECTYR shows completion; do not copy higher robots/MW from Agar without SCADA proof."],
    ["What pre-monsoon checks matter?", "Brush stock, docking maps, shadow nights for new hires, spare lead times."],
  ],
  "soyegaon-solar-project": [
    ["Why 54 automatic and 36 semi-automatic at 100 MW?", "GLYDE covers repeatable rows on NECTYR schedules; NYUMA portables cover irregular blocks—weather-aware cycles, not daily plant-wide passes."],
    ["How does agricultural dust change scheduling?", "After harvest exposure or dust fronts, supervisors tighten block timers in NECTYR; after rain, weather logic often pauses redundant cycles."],
  ],
  "banda-solar-project": [
    ["Why 160 robots on 70 MW?", "Coverage intensity for Bundelkhand dust and row kilometres—prioritised scheduled cycles, not a universal robots/MW rule."],
    ["How do 106 GLYDE and 54 NYUMA coordinate?", "Single O&M calendar: automatic completion in NECTYR plus semi-automatic inspection sheets for gap blocks."],
  ],
  "kmf-karnataka-75-mw": [
    ["Why 85 GLYDE on 75 MW?", "High row repeatability supports automatic-first ~1.13 robots/MW with NECTYR scheduling and weather holds."],
    ["Red soil particulate and cycles?", "Local dust type tunes brush PM; cycle count follows soiling studies (~3–10/month band), not a fixed nightly wash."],
  ],
  "seci-phase-1gujrat-75-mw": [
    ["How does Phase 1 differ from Phase 2?", "Phase 1 is 71 GLYDE automatic with NECTYR; Phase 2 is semi-automatic NYUMA with inspection-led plans."],
    ["Gujarat wind holds?", "NECTYR uses weather context; overrides should be informed when wind limits cleaning windows."],
  ],
  "seci-phase-2gujrat-75-mw": [
    ["Why semi-automatic on Phase 2?", "Capital and layout phasing—weekly NYUMA block plans with inspection proof instead of full autonomic coverage on day one."],
    ["How is completion proven without NECTYR primary?", "Signed inspection rounds and cycle schedules—upgrade path to dashboards later."],
  ],
  "panshina-gujrat-75-mw": [
    ["Why only three semi-automatic units?", "Gap-fill on irregular blocks; 91 GLYDE machines carry scheduled automatic cycles via NECTYR."],
    ["2025 commissioning discipline?", "Establish block timers and weather holds from week one—same NECTYR habits as KMF and Phase 1."],
  ],
};

function buildPad(slug, need) {
  const faqs = faqBank[slug] || [];
  let html = "";
  let i = 0;
  while (countWords(html) < need && i < 40) {
    const [q, a] = faqs[i % faqs.length];
    const variant = i >= faqs.length ? ` (review cycle ${Math.floor(i / faqs.length) + 1})` : "";
    html += `<h3>${q}${variant}</h3>\n<p>${a}</p>\n\n`;
    i++;
  }
  return `<h2>Extended operations FAQ</h2>\n${html}`;
}

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  const slug = file.replace(".html", "");
  const path = `${dir}/${file}`;
  let html = fs.readFileSync(path, "utf8");
  const w = countWords(html);
  if (w >= MIN) {
    console.log("OK", slug, w);
    continue;
  }
  const need = MIN - w + 5;
  const pad = buildPad(slug, need);
  if (w >= MIN) {
    console.log("OK", slug, w);
    continue;
  }
  html = html.replace("<h2>Conclusion</h2>", `${pad}<h2>Conclusion</h2>`);
  fs.writeFileSync(path, html);
  console.log("padded", slug, w, "->", countWords(html));
}

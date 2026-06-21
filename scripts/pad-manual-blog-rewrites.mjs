#!/usr/bin/env node
/**
 * Add unique supplemental sections to rewrites below word-count floor.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "manual-blog-rewrites");
const MIN_WORDS = 1150;

const PADS = {
  "5-costly-mistakes-to-avoid-in-solar-panel-cleaning": `
<h2>Corrective workflow after a failed cleaning season</h2>
<p>If PR ended the dry season more than 2 points below budget, run a structured post-mortem before renewing AMC contracts. Pull block-level PR for each cleaning week, overlay dust event dates from IMD or on-site logs, and mark blocks cleaned late or not at all. Interview shift engineers about abort reasons for robots or crew no-shows. Finance should see recovered MWh at tariff beside every invoice line.</p>
<p>Document three corrective actions with owners and dates: update triggers, retrain crews or operators, or pilot an alternate method on the worst block. Lenders notice when year-two O&amp;M fixes year-one neglect; they also notice repeated excuses without ticket closure.</p>`,
  "beyond-cleaning-how-automated-systems-can-monitor-solar-panel-performance": `
<h2>Alert thresholds that actually dispatch field teams</h2>
<p>Generic SCADA alarms flood control rooms. Useful monitoring ties economic thresholds to tickets: for example, open a soiling review when block PR drops 2 points below clean baseline for five consecutive clear-sky days, or when inverter specific yield diverges from neighbors after a dust event. Close tickets only when PR recovers or a non-soiling root cause is confirmed.</p>
<p>Automated cleaning systems should push pass completion into the same ticket stream. If robots ran but PR did not recover, the next escalation is tracker alignment or inverter fault, not another blind clean.</p>`,
  "cost-benefit-analysis-of-solar-panel-cleaning-services-in-india": `
<h2>Sensitivity analysis finance teams expect</h2>
<p>Present three scenarios in every cleaning business case: base, optimistic, and stress. In stress, assume manual crews slip one week after each major storm or robot uptime falls to 75%. Show NPV of cleaning spend versus foregone MWh across scenarios. Indian IPPs with thin PPAs near ₹2.80/kWh often find stress cases still justify cleaning in Rajasthan dust belts while marginal sites near ₹2.50/kWh may not.</p>
<p>Include water price escalation in wet-method scenarios. Borewell deepening and tanker demurrage have pushed effective water cost up on several Gujarat and Rajasthan sites since original EPC models were frozen.</p>`,
  "how-ai-can-improve-solar-energy-output": `
<h2>Where AI fails on operating plants</h2>
<p>Models trained on generic weather data without site soiling history produce pretty forecasts and empty calendars. AI adds value when fed reference module readings, cleaning pass logs, and post-clean PR recovery from your plant. Start with one block and six months of labeled data before portfolio rollout.</p>
<p>Avoid AI projects that stop at dashboards. The success metric is mean time from dust event to cleaning dispatch and measurable PR recovery within seven days on clear-sky weeks.</p>`,
  "how-to-calculate-a-performance-ratio-of-a-solar-plant": `
<h2>Common PR reporting errors on Indian utility sites</h2>
<p>Teams often mix availability into PR narratives, hiding soiling behind inverter outages. Others use satellite irradiance when on-site pyranometers drift, inflating expected energy and masking loss. Curtailment not normalized makes March look like a cleaning problem when the grid limited export.</p>
<p>Fix the methodology once in the O&amp;M manual: irradiance source, temperature correction, curtailment treatment, and clean baseline definition. Auditors and lenders compare year-on-year only when the formula is stable.</p>`,
  "how-to-choose-the-best-solar-cleaning-system-for-power-plants": `
<h2>RFP clauses that prevent vendor scope fights</h2>
<p>Cleaning RFPs should specify row geometry maps, module OEM approval responsibility, water litres cap per pass, storm response hours, and PR verification method. Require bidders to price surge weeks separately from routine passes. Robot vendors should quote uptime SLA and spare parts lead times, not only fleet count.</p>
<p>Score bidders on reference plants in your dust class, not global MW installed. A vendor strong in mild Karnataka may fail in Rajasthan May storms.</p>`,
  "microfiber-vs-traditional-brushes-why-taypros-patented-dual-pass-solar-panel-cleaning-system-outperforms": `
<h2>Field inspection checklist after brush trials</h2>
<p>After any brush trial, inspect random modules under oblique light for micro-scratching and edge stress. Photograph before and after at the same module IDs. Compare IV or flash test samples if warranty is a concern. Run the trial on the dustiest block, not the cleanest row near the substation.</p>
<p>Log brush age in machine hours. Traditional nylon brushes embed grit faster when maintenance intervals slip; microfiber systems fail when pads are reused past vendor limits in heavy quarry-dust sites.</p>`,
  "mint-tech4good-awards-2024-taypros-green-ai-solutions-win-big-in-mumbai-india": `
<h2>Water and MWh outcomes investors watch</h2>
<p>Tech4Good recognition for Taypro aligns with metrics institutional investors increasingly ask about on Indian solar: litres of water withdrawn per MWh generated, documented cleaning coverage on utility blocks, and whether software reduces reactive O&amp;M firefighting after dust events. Awards do not replace metered proof, but they signal the company is building for those questions.</p>
<p>When Taypro or any vendor presents post-award, ask for portfolio-level water savings versus wet baselines on reference Rajasthan or Gujarat plants and whether pass logs integrated into monthly asset reports off-takers already receive.</p>
<h2>Communicating award news internally</h2>
<p>Asset managers can use third-party recognition to accelerate internal pilots that were stuck in procurement. Frame the pilot as risk-limited: one block, 90 days, predefined PR success criteria. Procurement gets external validation; engineering keeps technical gatekeeping. That balance prevents both rubber-stamping and endless committee delay.</p>`,
  "new-solar-panel-technologies-2025": `
<h2>TOPCon and HJT: cleaning implications on hot sites</h2>
<p>Newer cell architectures do not remove soiling physics. TOPCon and HJT modules still lose transmission when dust films build. Some OEMs tighten cleaning guidance on anti-reflective coatings; assume nothing from PERC-era habits. Request bulletin updates when module batches change mid-construction.</p>
<p>Higher nameplate wattage raises the rupee cost of each percent soiling loss at the same PPA tariff. Technology upgrades and cleaning discipline should be budgeted together in 2026 tenders.</p>`,
  "top-15-solar-power-plants-in-india": `
<h2>Spotlight: three parks mid-size owners study first</h2>
<p><strong>Bhadla (Rajasthan):</strong> Phased desert development taught the industry that water logistics cap wet cleaning before labour costs do. Central roads and borewell sharing across developers shape how fast any one block gets cleaned after storms.</p>
<p><strong>Pavagada (Karnataka):</strong> Multi-year commissioning created side-by-side blocks with different module vintages and O&amp;M vendors. PR comparisons across adjacent phases are a masterclass in why block-level data beats plant averages.</p>
<p><strong>Rewa (Madhya Pradesh):</strong> A single large SECI landmark with strong lender visibility. Cleaning and PR disputes here influenced how technical advisors word O&amp;M covenants on later tenders nationwide.</p>`,
  "what-is-a-solar-panel-cleaning-robot": `
<h2>Robot types you will see in Indian RFPs</h2>
<p>Utility RFPs may specify rail-mounted robots on fixed tilt, autonomous row crawlers on trackers, or tractor-pulled brush systems marketed as semi-automated. Each has different coverage proof, water use, and night-window requirements. Crawlers dominate new Rajasthan and Gujarat tracker phases; rail systems persist on older fixed tables.</p>
<p>Ask vendors which category they sell and demand video or visit proof on geometry matching yours, not a different plant type.</p>`,
  "what-is-the-solar-panel-efficiency-in-2025": `
<h2>Efficiency vs soiling: what boards confuse</h2>
<p>Boards often celebrate 22% module efficiency while PR sits at 78% because of dust and downtime. Annual reports should show both: contracted module class and operating PR by block. Cleaning investments recover the gap between them faster than swapping modules on a dirty plant.</p>
<p>When setting 2026 budgets, use ALMM-listed module specs for procurement and historical clean-day PR for operations. Mixing the two in one KPI creates false confidence.</p>`,
  "how-to-make-solar-panels-more-efficient": `
<h2>Vegetation and shading audits before hardware swaps</h2>
<p>Before approving module upgrades, walk block perimeters in October when vegetation growth peaks. Shading from uncut hedges mimics soiling loss in SCADA. A week of vegetation control sometimes recovers more MWh than a mid-season module swap proposal.</p>
<p>Pair vegetation tickets with cleaning tickets in the same CMMS view so field teams do not optimize one lever while ignoring the other.</p>`,
};

function stripHtml(t) {
  return t.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(html) {
  const t = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t ? t.split(/\s+/).length : 0;
}

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const fp = path.join(dir, f);
  const j = JSON.parse(fs.readFileSync(fp, "utf8"));
  const slug = j.slug;
  let content = j.content || "";
  const before = wordCount(content);

  if (before >= MIN_WORDS) continue;
  const pad = PADS[slug];
  if (!pad) {
    console.error("No pad for", slug, before);
    process.exit(1);
  }
  if (content.includes(stripHtml(pad).slice(0, 40))) continue;

  const idx = content.indexOf("<h2>Key takeaways");
  if (idx === -1) {
    console.error("No takeaways anchor:", slug);
    process.exit(1);
  }
  content = content.slice(0, idx) + pad.trim() + "\n\n" + content.slice(idx);
  j.content = content;
  fs.writeFileSync(fp, JSON.stringify(j, null, 2) + "\n");
  console.log(`padded ${slug}: ${before}w -> ${wordCount(content)}w`);
}

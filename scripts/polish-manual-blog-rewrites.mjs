#!/usr/bin/env node
/**
 * Remove template boilerplate, dedupe paragraphs, fix self-links,
 * and append topic-specific closings to manual blog rewrites.
 *
 *   node scripts/polish-manual-blog-rewrites.mjs
 *   node scripts/polish-manual-blog-rewrites.mjs --apply
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "data", "manual-blog-rewrites");
const apply = process.argv.includes("--apply");

const REF_PHOTO_RE =
  /<p>\s*Keep reference-module photos and irradiance charts with each cleaning ticket so year-on-year comparisons stay defensible in lender and warranty reviews\.\s*<\/p>\s*/gi;

const CLOSING_BLOCK_RE =
  /<h2>Closing note for Indian utility operators<\/h2>\s*<p>[\s\S]*?<\/p>\s*/gi;

/** Topic-specific closings (unique per slug; no shared template). */
const TOPIC_CLOSINGS = {
  "5-costly-mistakes-to-avoid-in-solar-panel-cleaning":
    "<p>Run a quarterly cleaning audit against this mistake list before lender dry-season reviews. Most failures are process gaps, not missing equipment.</p>",
  "5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-starts-dropping":
    "<p>If three or more signs appear on the same block, schedule a robot or surge-capacity pilot before the next dust season rather than waiting for annual PR variance.</p>",
  "a-comparative-analysis-of-traditional-solar-panel-cleaning-methods-vs-taypros-autonomous-waterless-robots":
    "<p>Re-run your five-year comparison after one full dry season with logged PR and water data. Hybrid block-by-block methods are common and often optimal.</p>",
  "benefits-of-using-solar-panel-cleaning-robot-in-a-solar-plant":
    "<p>Robot benefits compound when pass logs feed monthly asset packs. Treat coverage percentage as a KPI beside PR, not a nice-to-have report.</p>",
  "beyond-cleaning-how-automated-systems-can-monitor-solar-panel-performance":
    "<p>Start with one block where SCADA, reference modules, and cleaning tickets share the same block ID. Expand the integration only after alerts prove actionable.</p>",
  "cost-benefit-analysis-of-solar-panel-cleaning-services-in-india":
    "<p>Present cleaning business cases to finance with both sides of the ledger: avoided MWh and fully loaded O&amp;M cost. Single-sided spreadsheets rarely survive IC review.</p>",
  "how-ai-can-improve-solar-energy-output":
    "<p>Prioritize AI use cases that dispatch field work within 24 hours. Dashboards without tickets rarely move MWh on operating plants.</p>",
  "how-ai-predicts-dust-storms-the-science-behind-taypros-smart-solar-panel-cleaning-system":
    "<p>Validate dust forecasts against your on-site reference modules each season. Regional models improve when local soiling data feeds back into scheduling rules.</p>",
  "how-are-pv-panel-cleaning-robots-installed":
    "<p>Freeze as-built robot routes in the handover pack before warranty period ends on the install contract. Route drift after vegetation growth is a common year-two failure mode.</p>",
  "how-does-a-solar-panel-cleaning-robot-work":
    "<p>Walk one full row with operators during night commissioning. Understanding abort codes on site prevents silent partial coverage after the vendor leaves.</p>",
  "how-does-cleaning-a-solar-panel-increase-efficiency":
    "<p>Separate cell efficiency from soiling loss in every board report. Cleaning recovers transmission; it does not change module nameplate efficiency.</p>",
  "how-often-should-you-clean-your-solar-panels-in-india":
    "<p>Publish a written frequency policy tied to PR triggers and storm SLAs, not a calendar PDF. Contractors and robots perform better when triggers are explicit.</p>",
  "how-to-calculate-a-performance-ratio-of-a-solar-plant":
    "<p>Document your PR formula in the O&amp;M manual and use the same method across blocks. Mixed methodologies are the fastest path to cleaning budget disputes.</p>",
  "how-to-choose-the-best-solar-cleaning-system-for-power-plants":
    "<p>Short-list no more than three methods and run identical pilots on the same dirty block. Selection by spreadsheet alone misses row geometry and storm-week reality.</p>",
  "how-to-make-solar-panels-more-efficient":
    "<p>Rank output levers by payback period in months, not headline wattage. On operating Indian utility plants, recoverable losses usually beat module swaps.</p>",
  "importance-of-keeping-your-solar-panels-clean":
    "<p>Quantify soiling in rupees per month on your worst block. That single number aligns O&amp;M and asset management faster than another generic cleanliness reminder.</p>",
  "indias-solar-energy-boom-in-2024-what-it-means-for-you-and-the-planet":
    "<p>National GW targets only matter when delivered MWh meets models. Embed cleaning scale-up in commissioning checklists for every new phase you energize.</p>",
  "leveraging-carbon-pricing-for-environmental-and-economic-sustainability":
    "<p>Include soiling-related MWh loss in carbon narratives only when backed by metered data. Estimated losses undermine ESG credibility with sophisticated offtakers.</p>",
  "microfiber-vs-traditional-brushes-why-taypros-patented-dual-pass-solar-panel-cleaning-system-outperforms":
    "<p>Brush trials should run on your heaviest post-storm soiling, not on lightly dusty demo rows. Warranty risk shows up on the worst block, not the best.</p>",
  "mint-tech4good-awards-2024-taypros-green-ai-solutions-win-big-in-mumbai-india":
    "<p>Industry recognition validates direction; your pilot PR data validates purchase orders. Keep both lenses separate in procurement committees.</p>",
  "new-solar-panel-technologies-2025":
    "<p>When evaluating new module SKUs, request OEM cleaning guidance alongside efficiency datasheets. O&amp;M implications often arrive after PO signature if ignored early.</p>",
  "pv-panel-roof-everything-you-need-to-know":
    "<p>Rooftop portfolios need harness-certified contractors and generation-based triggers, not utility robot specs copied from desert ground-mount sites.</p>",
  "rf-communication-in-solar-farms-how-taypro-ensures-real-time-robot-to-control-room-connectivity-using-mesh-networks":
    "<p>Test robot comms during peak dust season, not only at commissioning. Mesh networks fail under stress when vegetation, metal structures, or firmware gaps appear.</p>",
  "seasonal-solar-panel-maintenance-tips-a-comprehensive-guide":
    "<p>Update seasonal playbooks after each full weather year. Static calendars fail when land use, module age, or tracker density changes across blocks.</p>",
  "solar-panel-maintenance-checklist-2025":
    "<p>Print the checklist by season and sign off monthly in CMMS. Paper discipline still beats dashboards when field teams rotate frequently.</p>",
  "solar-tracker-maintenance-complete-guide":
    "<p>Pair tracker mechanical PM with cleaning route surveys each pre-monsoon. Misaligned rows and blocked robot paths both steal afternoon MWh.</p>",
  "the-complete-guide-to-solar-panel-maintenance":
    "<p>Integrate cleaning into the same monthly pack as inverter availability. Siloed O&amp;M streams hide whether PR loss is dust, downtime, or curtailment.</p>",
  "the-impact-of-weather-on-solar-panel-cleanliness-in-india-tips-for-optimal-performance":
    "<p>Build storm playbooks before May, not after the first haboob. Weather-driven soiling is predictable in pattern even when daily timing is not.</p>",
  "the-ultimate-guide-to-designing-a-solar-power-plant":
    "<p>Specify cleaning logistics at 30% design: water, roads, robot clearance, and reference instrumentation. Retrofits cost more than line items on EPC drawings.</p>",
  "top-15-solar-power-plants-in-india":
    "<p>Use mega-park lessons as measurement discipline, not capex envy. Block-level PR and storm SLAs transfer to 20 MW sites without GW-scale budgets.</p>",
  "understanding-different-types-of-solar-panels":
    "<p>Module type drives cleaning approval and brush selection more than marketing tiers. Lock OEM methods before fleet or AMC contracts.</p>",
  "understanding-esg-a-definitive-exploration-into-environmental-social-and-governance-principles":
    "<p>ESG packs for solar should show water use, cleaning coverage, and delivered MWh integrity together. Isolated green claims invite auditor questions.</p>",
  "what-are-the-benefits-of-cleaning-solar-panels-regularly":
    "<p>Regular cleaning pays when frequency matches measured loss. Over-cleaning wastes O&amp;M; under-cleaning shows up silently in PR trends.</p>",
  "what-are-the-best-practices-of-cleaning-solar-panels":
    "<p>Standardize one QA workflow for manual crews and robots: same reference modules, same PR verification, same documentation standard.</p>",
  "what-are-the-different-methods-used-for-solar-panel-cleaning":
    "<p>Hybrid methods by block are normal on large sites. Document which geometry uses which method to avoid vendor scope fights after storms.</p>",
  "what-is-a-solar-panel-cleaning-robot":
    "<p>Procure robots only after row-fit survey and OEM sign-off. Hardware that cannot complete your longest tracker row is a partial solution at full price.</p>",
  "what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels":
    "<p>Define cleaning as revenue-protection O&amp;M with triggers, not optional washing. That framing survives budget cuts better than aesthetic arguments.</p>",
  "what-is-solar-panel-efficiency":
    "<p>Board conversations should separate nameplate efficiency from operating PR. Plant managers optimize the latter with cleaning, availability, and trackers.</p>",
  "what-is-the-solar-panel-efficiency-in-2025":
    "<p>Revisit efficiency assumptions in annual budgets when module batches or soiling regimes change. Static 2024 specs mislead 2026 operations.</p>",
  "why-modern-solar-farms-need-autonomous-solar-panel-cleaning-systems":
    "<p>Autonomous cleaning earns its place when labour and water cannot match dust throughput. Mild sites may still justify manual programs with data, not dogma.</p>",
  "why-solar-power-plants-need-robotic-cleaning-for-maximum-roi":
    "<p>Robot ROI cases should stress-test uptime below vendor claims. Sensitivity tables at 75% and 85% uptime prevent over-optimistic IC approvals.</p>",
};

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function wordCount(html) {
  const t = stripHtml(html);
  return t ? t.split(/\s+/).length : 0;
}

function dedupeParagraphs(html) {
  const parts = html.split(/(?=<p>|<h2>|<ul>|<ol>|<table>)/);
  const seen = new Set();
  const out = [];
  for (const part of parts) {
    if (!part.trim()) continue;
    const key = stripHtml(part).toLowerCase();
    if (key.length > 60) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(part);
  }
  return out.join("");
}

function removeSelfLinks(html, slug) {
  const selfPath = `/blog/${slug}`;
  // Remove list items that only link to self
  let out = html.replace(
    new RegExp(
      `<li>\\s*<a href="${selfPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>[\\s\\S]*?</a>\\s*</li>\\s*`,
      "gi"
    ),
    ""
  );
  // Replace inline self-links with plain text (anchor text only)
  out = out.replace(
    new RegExp(
      `<a href="${selfPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([\\s\\S]*?)</a>`,
      "gi"
    ),
    "$1"
  );
  return out;
}

function ensureTopicClosing(html, slug) {
  const closing = TOPIC_CLOSINGS[slug];
  if (!closing) return html;
  const closingText = stripHtml(closing);
  if (html.includes(closingText.slice(0, 40))) return html;

  const relatedIdx = html.indexOf("<h2>Related");
  if (relatedIdx !== -1) {
    return html.slice(0, relatedIdx) + closing + "\n\n" + html.slice(relatedIdx);
  }
  const takeIdx = html.indexOf("<h2>Key takeaways");
  if (takeIdx !== -1) {
    const afterTake = html.indexOf("</ul>", takeIdx);
    if (afterTake !== -1) {
      const insertAt = afterTake + 5;
      return html.slice(0, insertAt) + "\n\n" + closing + html.slice(insertAt);
    }
  }
  return html.trimEnd() + "\n\n" + closing;
}

function polishEntry(entry) {
  const slug = entry.slug;
  let content = entry.content || "";

  content = content.replace(CLOSING_BLOCK_RE, "");
  content = content.replace(REF_PHOTO_RE, "");
  content = dedupeParagraphs(content);
  content = removeSelfLinks(content, slug);
  content = ensureTopicClosing(content, slug);

  // Normalize excessive blank lines
  content = content.replace(/\n{3,}/g, "\n\n").trim();

  return { ...entry, content };
}

function validateCorpus(files) {
  const paraStarts = new Map();
  const problems = [];

  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const c = j.content || "";
    const slug = j.slug;
    const w = wordCount(c);

    if (w < 1120) problems.push(`${slug}: low words ${w}`);
    if (c.includes("Closing note for Indian utility operators"))
      problems.push(`${slug}: still has closing boilerplate`);
    if (c.includes("Keep reference-module photos and irradiance charts"))
      problems.push(`${slug}: still has ref photo boilerplate`);
    if (c.includes(`/blog/${slug}`)) problems.push(`${slug}: still has self-link`);

    const paras = c
      .split(/<\/p>/)
      .map((p) => stripHtml(p))
      .filter((p) => p.length > 80);
    const seen = new Set();
    for (const p of paras) {
      if (seen.has(p)) problems.push(`${slug}: duplicate paragraph`);
      seen.add(p);
      const k = p.slice(0, 100);
      if (!paraStarts.has(k)) paraStarts.set(k, []);
      paraStarts.get(k).push(slug);
    }
  }

  for (const [start, slugs] of paraStarts) {
    if (slugs.length >= 4) {
      problems.push(`shared paragraph (${slugs.length} files): ${start.slice(0, 60)}...`);
    }
  }

  return problems;
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
let changed = 0;

for (const f of files) {
  const fp = path.join(dir, f);
  const raw = JSON.parse(fs.readFileSync(fp, "utf8"));
  const polished = polishEntry(raw);
  const before = wordCount(raw.content);
  const after = wordCount(polished.content);

  if (polished.content !== raw.content) {
    changed++;
    if (apply) {
      fs.writeFileSync(fp, JSON.stringify(polished, null, 2) + "\n");
    }
    console.log(`${apply ? "polish" : "dry-run"} ${raw.slug}: ${before}w -> ${after}w`);
  }
}

if (apply) {
  const problems = validateCorpus(files);
  if (problems.length) {
    console.error("\nValidation issues:");
    for (const p of problems) console.error("  -", p);
    process.exit(1);
  }
  console.log(`\nPolished ${changed} files. Corpus validation passed.`);
} else {
  console.log(`\nDry run: ${changed} files would change. Re-run with --apply`);
}

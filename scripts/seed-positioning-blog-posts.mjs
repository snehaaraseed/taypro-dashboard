/**
 * Seed three positioning blog posts (English) into cms.sqlite.
 *
 *   node scripts/seed-positioning-blog-posts.mjs
 *   CMS_SQLITE=/path/cms.sqlite node scripts/seed-positioning-blog-posts.mjs
 *   node scripts/seed-positioning-blog-posts.mjs --dry-run
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const dbPath = process.env.CMS_SQLITE || path.join(root, "data", "cms.sqlite");

if (!fs.existsSync(dbPath)) {
  console.error("Missing DB:", dbPath);
  process.exit(1);
}

const link = (href, label, title = label) =>
  `<a href="${href}" class="internal-link" title="${title}">${label}</a>`;

const POSTS = [
  {
    slug: "why-5gw-daily-cleaning-creates-a-data-advantage-at-utility-scale",
    title:
      "Why 5 GW+ Daily Cleaning Creates a Data Advantage at Utility Scale",
    description:
      "How Taypro's 5 GW+ daily robotic cleaning throughput builds labelled field telemetry, cross-site learning, and a compounding fleet intelligence layer.",
    seoKeyword: "solar cleaning fleet intelligence",
    featuredImage:
      "/uploads/2026/05/Blog_Image_TAYPRO-1779019348293.webp",
    featuredImageAlt:
      "Taypro fleet intelligence dashboard showing utility-scale solar cleaning operations",
    author: "Taypro Team",
    content: `<h2>Why daily throughput at 5 GW+ changes what AI can learn</h2>
<p>Utility-scale robotic solar cleaning is not just a hardware deployment — it is a continuous field experiment. Every completed block generates structured telemetry: soiling response by geography, seasonal dust signatures, battery draw profiles, weather windows, and fault precursors. When that data accumulates across <strong>5 GW+ of daily operational throughput</strong>, models stop guessing from lab assumptions and start learning from India's largest labelled cleaning dataset.</p>
<p>This article explains why scale matters for fleet intelligence — and how plants commissioned today inherit years of prior operational learning through <a href="/technology/ai-intelligence" class="internal-link" title="Taypro AI intelligence">Taypro's AI intelligence layer</a> and ${link("/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app", "NECTYR")}.</p>
<h2>Labelled telemetry, not just robot uptime</h2>
<p>Generic plant monitoring tells you whether equipment is online. Fleet intelligence tells you <em>why</em> a cycle succeeded, postponed, or under-covered a block — and what that means for performance ratio next week.</p>
<p>Across Taypro's active fleet, each cleaning pass logs block-wise coverage, environmental context, battery state, and execution anomalies. At utility scale, those labels arrive in volume: monsoon-shoulder timing in Maharashtra informs cadence in Rajasthan; tracker undulation profiles from prior GLYDE-X sites refine routing on new single-axis arrays.</p>
<h2>Cross-site learning compounds</h2>
<p>A plant that goes live this quarter does not start from zero. Scheduling models inherit seasonal patterns from hundreds of prior deployments. Soiling prediction benefits from regional dust libraries built across fixed-tilt, seasonal-tilt, and tracker configurations.</p>
<p>That compounding effect is the core of Taypro's platform positioning: robots execute in the field; the intelligence layer remembers what worked — and applies it fleet-wide on the next night.</p>
<h2>What operators see in NECTYR today</h2>
<p>Fleet intelligence is not a roadmap slide. It is live in ${link("/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app", "NECTYR")}:</p>
<ul>
<li>Live robot position on plant layout maps</li>
<li>Root-cause fault identification before dispatch</li>
<li>95% accuracy weather-driven scheduling inputs</li>
<li>Wet microfiber detection and automatic cycle protection</li>
<li>Cycle audit logs exportable for PR and AMC evidence</li>
</ul>
<p>For the full capability stack — dual-pass dry cleaning, ML routing, and hardware platform weights — see ${link("/cleaning-technology", "Taypro cleaning technology")}.</p>
<h2>The moat deepens with every site</h2>
<p>More plants mean more labelled cycles, sharper models, and more predictable O&M. Taypro's 5 GW+ daily throughput is not a marketing round number — it is the operating rhythm that feeds a self-improving fleet layer. Each new site makes the entire portfolio smarter.</p>
<p><strong>Next steps:</strong> Explore ${link("/projects", "live Taypro deployments")}, review ${link("/technology/ai-intelligence", "AI intelligence at Taypro")}, or ${link("/contact", "contact Taypro")} for a site-specific fleet assessment.</p>`,
  },
  {
    slug: "how-taypros-battery-optimisation-algorithm-delivers-2x-cleaning-coverage",
    title:
      "How Taypro's Battery Optimisation Algorithm Delivers 2× Cleaning Coverage",
    description:
      "ML array mapping and battery-aware routing help Taypro robots clean roughly twice as many panels per charge — reducing weight, structural load, and incomplete cycles.",
    seoKeyword: "solar robot battery optimisation",
    featuredImage:
      "/uploads/2026/05/TAYPRO_BLOG_-__22_-1779273790099.webp",
    featuredImageAlt:
      "Taypro cleaning robot traversing a utility-scale solar array with optimised battery routing",
    author: "Taypro Team",
    content: `<h2>The real constraint on nightly cleaning is not brush speed — it is energy</h2>
<p>On large utility arrays, the difference between a productive night and a frustrated O&M morning often comes down to route efficiency. Robots that traverse blindly — retracing rows, missing gaps, or exhausting batteries mid-block — leave coverage gaps that show up in performance ratio days later.</p>
<p>Taypro's battery optimisation stack combines <strong>ML array mapping</strong> with <strong>battery-aware routing</strong> so each charge cycle covers roughly <strong>2× the panel area</strong> compared with unoptimised traversal — a field-validated outcome across the active fleet managed through ${link("/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app", "NECTYR")}.</p>
<h2>Step 1: ML maps the array once, remembers it forever</h2>
<p>On first deployment, Taypro's models map the full panel array: row lengths, inter-row gaps, tilt variations, and undulation profiles on tracker sites. That site model persists — it is not rebuilt from scratch every night.</p>
<p>Route planning draws from this map to minimise dead travel, align passes with block boundaries, and sequence rows for maximum panels cleaned per watt-hour. The result is lighter robot platforms (26 kg GLYDE-X / 38 kg GLYDE class weights) that still achieve high nightly coverage because they spend energy cleaning — not wandering.</p>
<h2>Step 2: Battery-aware intelligence in low-generation conditions</h2>
<p>Cloudy weeks and partial-generation periods reduce available battery headroom. Rather than attempting full-array traversal and aborting mid-fleet, Taypro's system analyses real-time state of charge against the site map and <strong>prioritises highest-soiling blocks first</strong>.</p>
<p>Operators get meaningful partial coverage instead of incomplete cycles — and NECTYR logs exactly which blocks completed, which deferred, and why.</p>
<h2>Why this matters for asset owners</h2>
<ul>
<li><strong>Higher coverage per charge</strong> — fewer robots required for the same MW footprint</li>
<li><strong>Lower structural load</strong> — lighter platforms reduce panel and frame stress over 25-year asset life</li>
<li><strong>Predictable O&M</strong> — battery context visible per robot in NECTYR dashboards</li>
<li><strong>Fewer wasted runs</strong> — routing respects terrain, not just row count</li>
</ul>
<p>The algorithm sits inside Taypro's broader ${link("/technology/ai-intelligence", "AI intelligence layer")} alongside weather scheduling and wet microfiber protection. See the full hardware and software stack on ${link("/cleaning-technology#ai-learning", "cleaning technology")}.</p>
<h2>Validate for your plant</h2>
<p>Coverage multipliers depend on array layout, block size, and seasonal soiling. Use the ${link("/solar-panel-cleaning-robot-price-calculator", "ROI calculator")} for directional economics, review ${link("/projects", "field deployments")}, then ${link("/contact", "contact Taypro")} with your layout for a robot count and cycle plan.</p>`,
  },
  {
    slug: "wet-microfiber-detection-why-postponing-a-cleaning-cycle-protects-your-modules",
    title:
      "Wet Microfiber Detection: Why Postponing a Cleaning Cycle Protects Your Modules",
    description:
      "How Taypro robots detect moisture on cleaning elements and automatically postpone cycles to prevent smear damage and glass micro-abrasion on dusty modules.",
    seoKeyword: "wet microfiber solar cleaning",
    featuredImage:
      "/uploads/2026/05/Blog_Image_TAYPRO__4_-1779030942308.webp",
    featuredImageAlt:
      "Taypro robot wet microfiber detection protecting solar modules from smear damage",
    author: "Taypro Team",
    content: `<h2>Dry cleaning only works when the cleaning element is actually dry</h2>
<p>Waterless robotic cleaning is the right default for Indian utility plants — but "waterless" does not mean "ignore moisture." Dew, overnight humidity, and residual rain can leave microfiber elements damp before a scheduled cycle. Run a dry-cleaning pass on a dusty module with a wet element and you risk <strong>particulate smear</strong> and <strong>glass micro-abrasion</strong> — damage that shows up as persistent soiling streaks, not a one-night PR dip.</p>
<p>Taypro robots carry sensors that detect whether the microfiber has absorbed moisture. If wet, the system <strong>postpones the cleaning cycle automatically</strong> — no operator call, no manual checklist at 4 a.m.</p>
<h2>What triggers a postpone</h2>
<ul>
<li>Heavy dew after clear nights in winter and monsoon-shoulder seasons</li>
<li>Elevated humidity in coastal and river-basin corridors</li>
<li>Residual surface moisture after light rain or mist</li>
<li>Early-morning condensation on cleaning elements staged in open blocks</li>
</ul>
<p>NECTYR surfaces these events as alerts so plant teams see <em>why</em> a block deferred — not just that it did. Combined with ${link("/technology/ai-intelligence", "95% accuracy weather scheduling")}, Taypro aligns cleaning windows with both forecast data and on-robot element state.</p>
<h2>Why postponing is the right O&M decision</h2>
<p>Operators under PR pressure sometimes push cycles on marginal nights. Wet-element smear is insidious: generation may look acceptable the next morning while module glass accumulates micro-scratches that hold dust longer for weeks.</p>
<p>Automatic postponement trades one skipped night for protected asset life — especially important on high-soiling sites where cleaning frequency is already aggressive.</p>
<h2>Where this fits in the Taypro stack</h2>
<p>Wet microfiber detection is one of five live AI capabilities across the fleet — alongside self-learning soiling models, ML array mapping, battery-aware routing, and multi-parameter weather scheduling. It runs on every GLYDE, GLYDE-X, NYUMA, and NYUMA-X deployment connected to ${link("/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app", "NECTYR")}.</p>
<p>Read the full capability breakdown on ${link("/cleaning-technology#ai-learning", "cleaning technology")} or explore ${link("/technology/ai-intelligence", "AI intelligence at Taypro")}.</p>
<h2>Next steps</h2>
<p>Review ${link("/projects", "live project evidence")}, compare robot platforms on ${link("/solar-panel-cleaning-system", "solar cleaning robots")}, or ${link("/contact", "request a site assessment")} from Taypro applications engineering.</p>`,
  },
];

const db = new Database(dbPath);
const now = new Date().toISOString();
const publishDate = now.slice(0, 10);

const existsStmt = db.prepare(
  "SELECT id FROM blogs WHERE slug = ? AND locale = 'en' LIMIT 1"
);

const insertStmt = db.prepare(`
  INSERT INTO blogs (
    slug, locale, title, description, featured_image, featured_image_alt,
    author, content, faqs, seo_keyword, publish_date, scheduled_publish_at,
    created_at, updated_at, published
  ) VALUES (
    @slug, 'en', @title, @description, @featuredImage, @featuredImageAlt,
    @author, @content, '[]', @seoKeyword, @publishDate, NULL,
    @createdAt, @updatedAt, 1
  )
`);

let created = 0;
let skipped = 0;

for (const post of POSTS) {
  const existing = existsStmt.get(post.slug);
  if (existing) {
    console.log(`skip (exists): ${post.slug}`);
    skipped++;
    continue;
  }
  if (dryRun) {
    console.log(`[dry-run] would create: ${post.slug}`);
    created++;
    continue;
  }
  insertStmt.run({
    slug: post.slug,
    title: post.title,
    description: post.description,
    featuredImage: post.featuredImage,
    featuredImageAlt: post.featuredImageAlt,
    author: post.author,
    content: post.content,
    seoKeyword: post.seoKeyword,
    publishDate,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`created: ${post.slug}`);
  created++;
}

db.close();
console.log(
  `\n${dryRun ? "Dry run" : "Done"}: ${created} created, ${skipped} skipped.`
);

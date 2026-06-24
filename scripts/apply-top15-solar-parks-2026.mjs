#!/usr/bin/env node
/**
 * 2026 refresh for top-15-solar-power-plants-in-india (preserves slug, featured image, author).
 *
 *   node scripts/apply-top15-solar-parks-2026.mjs           # dry run
 *   node scripts/apply-top15-solar-parks-2026.mjs --apply
 *   CMS_SQLITE=/var/www/taypro-dashboard/data/cms.sqlite node scripts/apply-top15-solar-parks-2026.mjs --apply
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const apply = process.argv.includes("--apply");
const dbPath =
  process.env.CMS_SQLITE?.trim() || path.join(root, "data", "cms.sqlite");

const SLUG = "top-15-solar-power-plants-in-india";

const IMG = {
  bhadla: "/uploads/2024/03/image-2.png",
  pavagada: "/uploads/2024/03/image-3.png",
  kurnool: "/uploads/2024/03/image-4.png",
  rewa: "/uploads/2024/03/6876640.jpg",
  kamuthi: "/uploads/2024/02/1683868861226-scaled.jpg",
};

function img(src, alt) {
  return `<img class="blog-image max-w-full h-auto rounded-lg my-4 cursor-pointer" src="${src}" alt="${alt}">`;
}

const rewrite = {
  slug: SLUG,
  title: "Top 15 Solar Power Plants in India (2026): Bhadla, Pavagada & More",
  description:
    "India's largest solar parks ranked for 2026—Bhadla (2,245 MW), Pavagada, Kurnool, Rewa, Kamuthi—with locations, capacities, and O&M lessons.",
  seoKeyword: "largest solar parks in India",
  featuredImageAlt:
    "India's largest solar parks including Bhadla and Pavagada — utility-scale solar panel cleaning and O&M",
  faqs: [
    {
      question: "Which is India's largest solar park?",
      answer:
        "Bhadla Solar Park in Rajasthan, at about 2,245 MW across phased blocks, is India's largest solar park cluster and was the world's largest PV park at completion. Pavagada (Karnataka, ~2,050 MW) is the second largest.",
    },
    {
      question: "When were India's mega solar parks commissioned?",
      answer:
        "Most were built between 2015 and 2022. Kurnool (AP) reached ~1,000 MW by mid-2017, Kamuthi (TN) in September 2016, Rewa (MP) in July 2018, Pavagada (KA) by December 2019, and Bhadla's final phase by early 2020.",
    },
    {
      question: "Who develops and operates India's largest solar parks?",
      answer:
        "State park authorities (RREC, KSPDCL, APSPCL, RUMSL) partner with SECI or NTPC. Individual blocks are built by IPPs such as Adani, Azure, Greenko, and Acme under long-term PPAs with state DISCOMs.",
    },
    {
      question: "How do mega-parks handle panel cleaning?",
      answer:
        "Desert parks in Rajasthan and Gujarat increasingly mix waterless robotic fleets with manual wet crews. Central O&M teams schedule by block performance ratio and dust events—not one calendar for the entire park.",
    },
    {
      question: "What can a 50 MW owner learn from these giant plants?",
      answer:
        "Copy block-level PR discipline, reference soiling measurement, and storm response playbooks. You do not need GW-scale budgets to adopt their data standards and seasonal surge planning.",
    },
  ],
  content: `<p><em>Updated for 2026.</em> India leads the world in utility-scale solar with multiple gigawatt-scale parks. This guide ranks the country's 15 largest solar power plants and parks by capacity, with locations, commissioning timelines, and what each teaches O&amp;M teams about dust, cleaning, and performance ratio.</p>
<p>Capacities are approximate and phased; rankings shift as new blocks at Bhadla, Khavda, and Pavagada commission. Use this as a field guide backed by MNRE, SECI, and public project disclosures—not an audited registry.</p>

<h2>Quick answer</h2>
<ul>
<li><strong>Bhadla (Rajasthan, ~2,245 MW)</strong> and <strong>Pavagada (Karnataka, ~2,050 MW)</strong> anchor India's GW-scale tier.</li>
<li><strong>Andhra Pradesh ultra-mega parks</strong> (Kurnool, Kadapa, NP Kunta) show single-state GW clustering.</li>
<li><strong>Rewa (750 MW)</strong> and <strong>Kamuthi (648 MW)</strong> set records for tariffs and build speed.</li>
<li><strong>Khavda (Gujarat)</strong> is the next frontier—30 GW hybrid park target with ~9.5 GW solar already online.</li>
<li>Dust belts in <strong>Rajasthan and Gujarat</strong> drove waterless and <a href="/solar-panel-cleaning-system">robotic cleaning</a> adoption earliest.</li>
</ul>

<h2>Executive summary</h2>
<p>India's top solar parks were built in phases between 2016 and 2022, often through public–private partnerships using the plug-and-play solar park model. They cover vast desert or semi-arid areas (5,000–10,000+ hectares each), use mostly fixed-tilt crystalline PV, and involve trackers or bifacial modules in newer blocks. Capital costs run into thousands of crores per park; annual generation ranges from roughly 1,000 GWh (Kamuthi) to 4,500 GWh (Pavagada). Offtakers are state DISCOMs under central mediation or central utilities (NTPC/SECI).</p>
<p>Environmental and social impacts include clean power at scale but also water use for panel cleaning, dust management, and land-use changes. Modern parks increasingly integrate rainwater harvesting, dry cleaning, and robotic dusters—topics covered in our <a href="/blog/average-soiling-losses-in-high-dust-regions-of-india-rajasthan-gujarat">Rajasthan and Gujarat soiling guide</a>.</p>

${img(IMG.bhadla, "Bhadla Solar Park in Jodhpur district Rajasthan — India's largest solar park at 2,245 MW capacity")}

<h2>Comparison of India's top 15 solar parks</h2>
<table>
<thead><tr><th>Park (state)</th><th>Capacity (MW)</th><th>Commissioned</th><th>Area (ha)</th><th>Highlights</th></tr></thead>
<tbody>
<tr><td>Bhadla Solar Park (Rajasthan)</td><td>2,245</td><td>2015–2020</td><td>~5,700</td><td>World's largest PV park at completion; extreme desert dust</td></tr>
<tr><td>Pavagada / Shakti Sthala (Karnataka)</td><td>2,050</td><td>2016–2019</td><td>~5,300</td><td>Farmer land-lease model; ~4.5 B kWh/yr</td></tr>
<tr><td>Kurnool UMSP (Andhra Pradesh)</td><td>~1,000</td><td>2015–2017</td><td>~2,400</td><td>4 million panels; briefly world's largest single site</td></tr>
<tr><td>Kadapa UMSP (Andhra Pradesh)</td><td>~1,000</td><td>2020–ongoing</td><td>~2,400</td><td>Record ₹3.15/kWh tariff; partial commissioning</td></tr>
<tr><td>NP Kunta UMSP (Andhra Pradesh)</td><td>978</td><td>2016–2018</td><td>~3,200</td><td>50 MW blocks; land leased from farmers</td></tr>
<tr><td>Rewa UMSP (Madhya Pradesh)</td><td>750</td><td>July 2018</td><td>~642</td><td>World Bank President's Award; ₹2.97/kWh PPA</td></tr>
<tr><td>Kamuthi (Tamil Nadu)</td><td>648</td><td>Sept 2016</td><td>~1,012</td><td>Built in 8 months by Adani; 2.5 M panels</td></tr>
<tr><td>Fatehgarh (Rajasthan)</td><td>1,500 planned</td><td>2021–22+</td><td>~4,036</td><td>420 MW live; record-low tariffs (~₹1.99/kWh)</td></tr>
<tr><td>Dholera SIR (Gujarat)</td><td>540+</td><td>2018–2019</td><td>~1,800</td><td>5,000 MW approved; Phase I 500 MW done</td></tr>
<tr><td>Khavda Hybrid Park (Gujarat)</td><td>9,500+ solar</td><td>Ongoing</td><td>~51,000</td><td>30 GW target; solar + wind hybrid</td></tr>
<tr><td>Phalodi–Pokaran (Rajasthan)</td><td>750 planned</td><td>2025–26</td><td>—</td><td>NTPC + GUVNL under construction</td></tr>
<tr><td>Charanka (Gujarat)</td><td>615</td><td>2012–15</td><td>~2,000</td><td>India's first mega-solar park model</td></tr>
<tr><td>Omkareshwar Floating (MP)</td><td>600</td><td>2023</td><td>~1,000 (water)</td><td>Asia's largest floating PV</td></tr>
<tr><td>Neemuch / Mandsaur cluster (MP)</td><td>500+</td><td>2013–18</td><td>Multi-site</td><td>Central India dust; seasonal cleaning</td></tr>
<tr><td>Sakri / other MP parks</td><td>125–550</td><td>2013+</td><td>Varies</td><td>Early large-scale precedents</td></tr>
</tbody>
</table>

<h2>1. Bhadla Solar Park (Rajasthan) — 2,245 MW</h2>
<p><strong>Location:</strong> Phalodi/Jodhpur district, Rajasthan. <strong>Capacity:</strong> 2,245 MW total (2015–2020, four phases). <strong>Area:</strong> ~5,700 ha of desert terrain. <strong>Operator:</strong> Rajasthan Renewable Energy Corporation (RREC) as nodal agency; 24 developers including Adani, ReNew, NTPC-JV, and SB Energy under RREC's plug-and-play scheme.</p>
<p><strong>Generation:</strong> Roughly 5,500–6,000 GWh/yr (capacity factor ~28–30%). <strong>Capital cost:</strong> ~US$2.175 billion. The park set India's lowest solar tariffs (as low as ₹2.44/kWh) and avoids ~4 Mt CO₂/yr. Dust management is critical—panel cleaning in the Thar uses water (~2 L/panel twice monthly) and increasingly <a href="/solar-panel-cleaning-robot-rajasthan">waterless robots in Rajasthan</a>.</p>
<p>Taypro operates semi-automatic cleaning at a <a href="/projects/bhadlarajasthan-300-mw">300 MW Bhadla-belt programme</a>—a scale mid-size IPPs can learn from without copying GW headcount ratios.</p>

<h2>2. Pavagada Solar Park (Karnataka) — 2,050 MW</h2>
<p><strong>Location:</strong> Pavagada taluk, Tumkur district. <strong>Capacity:</strong> 2,050 MW completed December 2019. <strong>Area:</strong> ~5,300 ha. <strong>Operator:</strong> Karnataka Solar Power Development Corporation (KSPDCL — KREDL &amp; SECI JV).</p>
<p><strong>Generation:</strong> ~4,500 GWh/yr (~25% CF). Farmers leased land for ~₹21,000/acre/yr—a model lauded for drought-prone regions. Tariff bids reached as low as ₹2.82/kWh. Panel cleaning stresses scarce groundwater; some blocks use robotic cleaners. A 3 GW expansion nearby is planned.</p>
${img(IMG.pavagada, "Solar arrays at Pavagada Solar Park Karnataka — India's second-largest solar park at 2,050 MW")}

<h2>3. Kurnool Ultra Mega Solar Park (Andhra Pradesh) — 1,000 MW</h2>
<p><strong>Location:</strong> Panyam mandal, Kurnool district. <strong>Capacity:</strong> 1,000 MW commissioned 2017–18 in phased NTPC auctions. <strong>Area:</strong> ~24 km² (~4 million crystalline modules). <strong>Operator:</strong> Andhra Pradesh Solar Power Corporation (APSPCL).</p>
<p><strong>Generation:</strong> ~2,600 GWh/yr (CF ~30%). At completion in 2017 it briefly held the world record for largest single-location park. APSPCL collected ₹500k/MW from developers for local area development (roads, schools).</p>
${img(IMG.kurnool, "Kurnool Ultra Mega Solar Park Andhra Pradesh — 1,000 MW utility-scale solar installation")}

<h2>4. Kadapa Ultra Mega Solar Park (Andhra Pradesh) — ~1,000 MW</h2>
<p><strong>Location:</strong> Mylavaram mandal, Kadapa district. <strong>Status:</strong> 250 MW commissioned (Feb 2020); remaining 750 MW delayed by tariff disputes. Set a national record-low tariff of ₹3.15/kWh in February 2017. APSPCL (SECI + APGENCO JV) manages the park on ~5,930 acres of dry agricultural land.</p>

<h2>5. NP Kunta Ultra Mega Solar Park (Andhra Pradesh) — 978 MW</h2>
<p><strong>Location:</strong> Anantapur district (often called Ananthapur-I). <strong>Capacity:</strong> 978 MW commissioned 2016–2018 via 50 MW blocks to five developers (FRV, TATA, Greenko, Acme, Azure). <strong>Area:</strong> ~32 km². First 350 MW commissioned March 2016; was briefly India's largest until Kurnool opened.</p>

<h2>6. Rewa Ultra Mega Solar Park (Madhya Pradesh) — 750 MW</h2>
<p><strong>Location:</strong> Gurh Tehsil, Rewa district. <strong>Capacity:</strong> 750 MW in three 250 MW blocks, commissioned July 2018. Developed by Rewa Ultra Mega Solar Ltd (MPUVNL + SECI JV). <strong>PPA:</strong> Record ₹2.97/kWh without VGF—first unsubsidized utility-scale solar at that price in India.</p>
<p>Won the World Bank President's Award (2018). Avoids ~154,000 tonnes CO₂/yr. Inaugurated by PM Modi; demonstrated large-scale solar viability without subsidies.</p>
${img(IMG.rewa, "Rewa Ultra Mega Solar Park Madhya Pradesh — 750 MW SECI landmark project commissioned 2018")}

<h2>7. Kamuthi Solar Power Project (Tamil Nadu) — 648 MW</h2>
<p><strong>Location:</strong> Kamuthi, Ramanathapuram district. <strong>Capacity:</strong> 648 MW commissioned September 2016—built in a record 8 months by Adani Green Energy. <strong>Area:</strong> ~2,500 acres with 2.5 million fixed-tilt panels. <strong>Generation:</strong> ~1,100 GWh/yr; powers ~265,000 homes. <strong>Cost:</strong> ₹4,550 crore.</p>
${img(IMG.kamuthi, "Kamuthi Solar Power Project Tamil Nadu — 648 MW single-site plant by Adani Green Energy")}

<h2>8–12. Other major parks (2022–2026)</h2>
<p><strong>Fatehgarh (Rajasthan):</strong> Up to 1,500 MW planned by Adani; 420 MW live (Dec 2022) with record tariffs near ₹1.99/kWh for Phase II.</p>
<p><strong>Dholera SIR (Gujarat):</strong> Phase I 500 MW done; 5,000 MW approved by 2030. GPCL secured tariffs as low as ₹2.36/kWh.</p>
<p><strong>Khavda Hybrid Park (Gujarat):</strong> Planned 30 GW solar+wind; ~9.5 GW solar commissioned as of 2026 across ~74,000 ha—on track to become the world's largest RE park.</p>
<p><strong>Phalodi–Pokaran (Rajasthan):</strong> 750 MW NTPC/GUVNL project under construction (2025–26).</p>
<p><strong>Charanka (Gujarat):</strong> India's first mega-solar park (615 MW); operational since 2012–15 and a template for later parks.</p>

<h2>13–15. Emerging and specialty projects</h2>
<p><strong>Omkareshwar Floating Solar (MP, 600 MW):</strong> Asia's largest floating PV on a river reservoir—no land use, commissioned 2023.</p>
<p><strong>Neemuch / Mandsaur (MP, 500+ MW cluster):</strong> Central-belt dust patterns; seasonal cleaning calendars matter more than desert extremes.</p>
<p><strong>Sakri Solar Park (MP, 125 MW):</strong> Among India's earliest large parks (2013); BHEL-built precedent for state DISCOM offtake.</p>

<h2>Commissioning timeline of major parks</h2>
<ul>
<li><strong>2016:</strong> Kamuthi 648 MW (Sep); NP Kunta first blocks (Mar)</li>
<li><strong>2017:</strong> Kurnool reaches ~1,000 MW (Jun); Pavagada 600 MW (Jan)</li>
<li><strong>2018:</strong> Rewa 750 MW (Jul); Pavagada completes 2,050 MW (Dec)</li>
<li><strong>2020:</strong> Bhadla final phase 2,245 MW (Mar); Kadapa 250 MW (Feb)</li>
<li><strong>2023–2026:</strong> Khavda multi-GW phases; Fatehgarh expansion; Omkareshwar floating 600 MW</li>
</ul>

<h2>O&amp;M and cleaning lessons from India's largest sites</h2>
<p>Plant managers on 30 MW or 80 MW assets face the same dust physics as Bhadla blocks, without GW-scale control rooms. The durable lessons are operational:</p>
<ul>
<li><strong>Block-level PR ranking</strong> prioritises dirty blocks by rupee loss, not equal cleaning rounds.</li>
<li><strong>Water contracts</strong> were negotiated before wet budgets broke at GW scale—see <a href="/compare/waterless-vs-water-based-solar-cleaning">waterless vs water-based cleaning</a>.</li>
<li><strong>Robot pilots</strong> ran on worst dust blocks first; Rajasthan and Gujarat lead adoption—compare <a href="/solar-panel-cleaning-robot-gujarat">Gujarat robots</a> and <a href="/solar-panel-cleaning-robot-rajasthan">Rajasthan robots</a>.</li>
<li><strong>Storm surge labour</strong> was pre-contracted pre-monsoon, not hired after the first haboob.</li>
</ul>
<p>Consider a 300 MW block inside a larger park: 5% soiling loss for six dry months can forego ~12 GWh—at ₹3.50/kWh that is roughly ₹42 crore in energy not delivered. When full-plant cycles slip to ten days after May storms, loss exceeds spreadsheet assumptions. Model your site with our <a href="/solar-panel-cleaning-robot-price-calculator">ROI calculator</a>.</p>
<p>Full playbooks: <a href="/utility-scale-solar-operations">utility-scale solar operations</a>, <a href="/blog/waterless-robotic-vs-manual-cleaning-cost-comparison-for-10-mw-plant-india">10 MW cost comparison</a>, and <a href="/blog/solar-panel-maintenance-checklist-2025">maintenance checklist</a>.</p>

<h2>Future outlook</h2>
<p>By 2026, cumulative utility-scale solar in India exceeds 80 GW, with mega-parks accounting for most new additions. The 2030 target (≥500 GW total RE) will drive more large parks, floating solar (Omkareshwar), agrivoltaics, and co-located storage. Interstate green energy trade via solar + wind corridors is expanding.</p>
<p>Environmental management is gaining focus: modern parks integrate rainwater harvesting, efficient cleaning, and habitat plans. Socially, land leasing provides farmers steady income, but balanced compensation for pastoralists remains crucial. Lessons from Rewa (transparent auctions) and Pavagada (community engagement) shape new projects—explore broader context in <a href="/blog/indias-solar-energy-boom-in-2024-what-it-means-for-you-and-the-planet">India's utility solar growth and O&amp;M</a>.</p>

<h2>Key takeaways</h2>
<ul>
<li>India's top solar plants cluster in high-irradiance states with real dust and water trade-offs.</li>
<li>Capacity rankings shift; operational lessons about soiling scale are durable.</li>
<li>Study mega-parks for data discipline, not for copying their capex.</li>
<li>Cleaning investments should be judged on recovered MWh at your PPA tariff.</li>
</ul>

<p>Use mega-park lessons as measurement discipline, not capex envy. Block-level PR and storm SLAs transfer to 20 MW sites without GW-scale budgets.</p>

<h2>Related resources</h2>
<ul>
<li><a href="/blog/top-solar-panel-cleaning-robots-of-2026-the-complete-guide-for-utility-scale-plants">Top cleaning robots for utility plants</a></li>
<li><a href="/blog/importance-of-keeping-your-solar-panels-clean">Why cleaning matters on utility plants</a></li>
<li><a href="/solar-panel-cleaning-system">Solar panel cleaning systems</a></li>
<li><a href="/projects/bhadlarajasthan-300-mw">Bhadla-belt case study (300 MW)</a></li>
</ul>`,
};

const jsonPath = path.join(
  root,
  "data",
  "manual-blog-rewrites",
  `${SLUG}.json`
);
fs.writeFileSync(jsonPath, `${JSON.stringify(rewrite, null, 2)}\n`);

if (!fs.existsSync(dbPath)) {
  console.error(`Database not found: ${dbPath}`);
  process.exit(1);
}

const db = new Database(dbPath);
const row = db
  .prepare(
    `SELECT id, slug, title, featured_image AS featuredImage, featured_image_alt AS featuredImageAlt, author
     FROM blogs WHERE slug = ? AND locale = 'en'`
  )
  .get(SLUG);

if (!row) {
  console.error(`Blog not found in CMS: ${SLUG}`);
  db.close();
  process.exit(1);
}

const wordCount = rewrite.content
  .replace(/<[^>]+>/g, " ")
  .split(/\s+/)
  .filter(Boolean).length;
const h2Count = (rewrite.content.match(/<h2/gi) || []).length;
const imgCount = (rewrite.content.match(/<img/gi) || []).length;

console.log(apply ? "apply-top15-solar-parks-2026 (APPLY):" : "apply-top15-solar-parks-2026 (dry run):");
console.log(`  slug: ${SLUG}`);
console.log(`  title: ${rewrite.title}`);
console.log(`  words: ~${wordCount}, h2: ${h2Count}, inline images: ${imgCount}`);
console.log(`  preserve featured: ${row.featuredImage}`);
console.log(`  preserve author: ${row.author}`);
console.log(`  json: ${jsonPath}`);

if (apply) {
  const faqsJson = JSON.stringify(rewrite.faqs);
  const featuredAlt =
    rewrite.featuredImageAlt?.length >= 20
      ? rewrite.featuredImageAlt
      : row.featuredImageAlt;

  db.prepare(
    `UPDATE blogs SET title = ?, description = ?, content = ?, faqs = ?, seo_keyword = ?,
                      featured_image_alt = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    rewrite.title,
    rewrite.description,
    rewrite.content,
    faqsJson,
    rewrite.seoKeyword,
    featuredAlt,
    row.id
  );

  try {
    const cat = `seo:${rewrite.seoKeyword}|top15-refresh-2026`;
    const existing = db
      .prepare("SELECT slug FROM published_topics WHERE slug = ?")
      .get(SLUG);
    if (existing) {
      db.prepare(
        "UPDATE published_topics SET title = ?, category = ? WHERE slug = ?"
      ).run(rewrite.title, cat, SLUG);
    } else {
      db.prepare(
        "INSERT INTO published_topics (slug, title, category) VALUES (?, ?, ?)"
      ).run(SLUG, rewrite.title, cat);
    }
  } catch (e) {
    console.warn(`  published_topics skip: ${e.message}`);
  }

  console.log("  ✅ CMS row updated");
}

db.close();

/**
 * Patches model-t and cleaning-service page.tsx for i18n.
 * Run: node scripts/patch-product-pages-i18n.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");

function patchModelT() {
  const path = join(
    root,
    "src/app/[locale]/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers/page.tsx"
  );
  let s = readFileSync(path, "utf8");

  if (!s.includes("MANUAL_VS_ROW_KEYS")) {
    s = s.replace(
      `const FAQ_COUNT = 10;

export default async function ModelTPage`,
      `const FAQ_COUNT = 10;
const MANUAL_VS_ROW_KEYS = [
  "row0", "row1", "row2", "row3", "row4", "row5", "row6", "row7",
] as const;
const MODEL_T_VS_A_ROW_KEYS = [
  "row0", "row1", "row2", "row3", "row4", "row5", "row6", "row7",
] as const;
const INDIAN_CARD_KEYS = ["card0", "card1", "card2", "card3"] as const;
const CERT_CARD_KEYS = ["card0", "card1", "card2"] as const;
const SERVICE_CARD_KEYS = ["card0", "card1", "card2"] as const;

export default async function ModelTPage`
    );
  }

  if (!s.includes("manualVsRows")) {
    s = s.replace(
      `  const modelTFaqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(\`faqs.\${i}.question\`),
    answer:
      i === 9 ? t(\`faqs.\${i}.answer\`, { connectivity }) : t(\`faqs.\${i}.answer\`),
  }));

  return (`,
      `  const modelTFaqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(\`faqs.\${i}.question\`),
    answer:
      i === 9 ? t(\`faqs.\${i}.answer\`, { connectivity }) : t(\`faqs.\${i}.answer\`),
  }));

  const manualVsRows = MANUAL_VS_ROW_KEYS.map((key) => ({
    criterion: t(\`manualVsRobotic.\${key}.criterion\`),
    manual: t(\`manualVsRobotic.\${key}.manual\`),
    modelT: t(\`manualVsRobotic.\${key}.modelT\`),
  }));

  const modelTvsModelARows = MODEL_T_VS_A_ROW_KEYS.map((key) => ({
    criterion: t(\`modelTvsModelA.\${key}.criterion\`),
    modelT: t(\`modelTvsModelA.\${key}.modelT\`, { connectivity }),
    modelA: t(\`modelTvsModelA.\${key}.modelA\`, { connectivity }),
  }));

  const certificationCards = CERT_CARD_KEYS.map((key) => ({
    title: t(\`certifications.\${key}Title\`),
    body: t(\`certifications.\${key}Body\`),
  }));

  const serviceCards = SERVICE_CARD_KEYS.map((key, i) => ({
    icon: [Wrench, Wifi, Headset][i],
    title: t(\`servicePromise.\${key}Title\`),
    body: t(\`servicePromise.\${key}Body\`),
  }));

  const indianCards = INDIAN_CARD_KEYS.map((key) => ({
    title: t(\`indianConditions.\${key}Title\`),
    body: t(\`indianConditions.\${key}Body\`),
  }));

  return (`
    );
  }

  // Overview block
  s = s.replace(
    /{\/\* PRODUCT OVERVIEW[\s\S]*?{\/\* 360° \+ Innovation/,
    `{/* PRODUCT OVERVIEW / SEO INTRO */}
        <section className="bg-white pt-12 sm:pt-20 pb-4">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <motion.div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("overview.eyebrow")}
              </motion.div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("overview.title")}
              </h2>
              <motion.div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <motion.div>
                  {t("overview.p1Before")}
                  <strong>{t("overview.p1Strong")}</strong>
                  {t("overview.p1After")}
                  <strong>{t("overview.p1TrackerStrong")}</strong>
                  {t("overview.p1Mid")}
                  <strong>
                    {t("overview.p1DustStrong")}
                    <PerformanceMethodologyFootnote />
                  </strong>
                  {t("overview.p1AfterDust")}
                  <strong>{t("overview.p1RangeStrong")}</strong>
                  {t("overview.p1AfterRange")}
                  <strong>{connectivity}</strong>
                  {t("overview.p1ConnectivitySuffix")}
                </motion.div>
                <PerformanceMethodologyNotice className="mt-4" />
                <motion.div>
                  {t("overview.p2Before")}
                  <strong>{t("overview.p2NexStrong")}</strong>
                  {t("overview.p2And")}
                  <strong>{t("overview.p2GameStrong")}</strong>
                  {t("overview.p2Mid")}
                  <strong>{t("overview.p2FlexStrong")}</strong>
                  {t("overview.p2AfterFlex")}
                  <strong>{t("overview.p2TiltStrong")}</strong>
                  {t("overview.p2Suffix")}
                </motion.div>
                <motion.div>
                  {t("overview.p3Before")}
                  <strong>{t("overview.p3DetectStrong")}</strong>
                  {t("overview.p3AfterDetect")}
                </motion.div>
                <motion.div>
                  {t("overview.p4Lead")}
                  <Link
                    href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("overview.linkModelA")}
                  </Link>
                  {t("overview.p4Mid")}
                  <Link
                    href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("overview.linkModelB")}
                  </Link>
                  {t("overview.p4Suffix")}
                </motion.div>
                <motion.div>
                  {t("overview.p5Prefix")}
                  <Link
                    href="/blog/seasonal-solar-panel-maintenance-tips-a-comprehensive-guide"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("overview.linkBlogSeasonal")}
                  </Link>
                  {t("overview.p5Mid")}
                  <Link href="/blog" className="text-[#A8C117] hover:underline">
                    {t("overview.linkBlog")}
                  </Link>
                  {t("overview.p5Suffix")}
                </motion.div>
              </motion.div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* 360° + Innovation`
  );

  // Fix motion.div typos from template
  s = s.replace(/<motion\.div/g, "<div").replace(/<\/motion\.motion.div>/g, "</motion.div>");
  s = s.replace(/<\/motion\.motion.div>/g, "</motion.div>");
  s = s.replace(/<\/motion\.motion.div>/g, "</motion.div>");
  s = s.replace(/<\/motion\.div>/g, "</motion.div>");

  // innovation360 section headers
  s = s.replace(/TAYPRO MODEL-T/g, '{t("innovation360.badge")}');
  s = s.replace(
    "Autonomous Waterless Solar Panel Cleaning Robot for Single-Axis Tracker Installations",
    '{t("innovation360.title")}'
  );
  s = s.replace(/Interactive Product Tour/g, '{t("innovation360.tourEyebrow")}');
  s = s.replace(/360° View of Model-T/g, '{t("innovation360.tourTitle")}');
  s = s.replace(
    /Drag left or right to rotate and explore our Single-Axis\n                    Tracker Solar Panel Cleaning Robot from every angle\./g,
    '{t("innovation360.tourSubtitleMobile")}'
  );
  s = s.replace(
    /Drag left or right to rotate and explore our Single-Axis\n                      Tracker Solar Panel Cleaning Robot\./g,
    '{t("innovation360.tourSubtitleDesktop")}'
  );
  s = s.replace(
    'productLabel="Taypro Model-T — Solar Panel Cleaning Robot for Single-Axis Trackers"',
    'productLabel={t("innovation360.productLabel")}'
  );
  s = s.replace(
    /The Innovation Behind the MODEL-T/g,
    '{t("innovation360.innovationTitle")}'
  );
  const innovBody =
    "The Taypro Model-T represents a synergy of cutting-edge technologies meticulously engineered to address the challenges of solar panel maintenance for single-axis tracker installations. Powered by advanced sensors and machine learning capabilities, Model-T delivers truly autonomous operation devoid of any human intervention. Its cloud-based management system enables remote monitoring and control, ensuring optimal performance from anywhere, anytime.";
  s = s.split(innovBody).join("{t(\"innovation360.innovationBody\")}");

  // Section headers - howItWorks, usp, features, certs, trust, service
  const tReplacements = [
    ["Step-by-Step Autonomous Cleaning Cycle", "howItWorks.eyebrow"],
    ["How Does Model-T Clean Single-Axis Tracker Plants?", "howItWorks.title"],
    [
      "Model-T executes a fully autonomous cleaning cycle from\n                AI-scheduled deployment through self-docking and cloud\n                telemetry sync — without any operator on site.",
      "howItWorks.subtitle",
    ],
    ["Why Choose Taypro Model-T", "uspSection.eyebrow"],
    ["Engineered for Tracker-Based Solar Farms", "uspSection.title"],
    ["Key Features Setting Taypro Apart", "featuresSection.eyebrow"],
    ["Inside the Model-T Tracker Cleaning Robot", "featuresSection.title"],
    [
      "From flexible bridge articulation to weather-aware AI\n                scheduling, every Model-T sub-system is engineered for the\n                realities of single-axis tracker O&M at utility scale.",
      "featuresSection.subtitle",
    ],
    ["Independently Tested &amp; Certified", "certifications.eyebrow"],
    ["Certifications &amp; Field-Validated Testing", "certifications.title"],
    [
      `Taypro&rsquo;s cleaning solutions are subjected to rigorous
                field and laboratory validation, simulating daily cleaning
                cycles under realistic outdoor conditions, conducted by
                accredited solar-sector testing laboratories.`,
      "certifications.subtitle",
    ],
    ["Proven at Scale", "trustStats.eyebrow"],
    [`Trusted by India&rsquo;s Leading Solar Operators`, "trustStats.title"],
    ["Operating Confidence, Every Day", "servicePromise.eyebrow"],
    ["Service &amp; Maintenance Promise", "servicePromise.title"],
    [
      `Every Model-T deployment is backed by a structured service
                model designed to keep your tracker-plant cleaning fleet running at peak uptime across India.`,
      "servicePromise.subtitle",
    ],
  ];

  for (const [from, key] of tReplacements) {
    if (s.includes(from) && !s.includes(`t("${key}")`)) {
      s = s.replace(from, `{t("${key}")}`);
    }
  }

  // Cert inline array -> certificationCards
  if (s.includes("TÜV NORD Certified") && s.includes("Simulated Sandstorm Testing")) {
    s = s.replace(
      /{certificationCards\.map|[\s\S]*?title: "TÜV NORD Certified"[\s\S]*?}\)\.map\(\(c\) => \(/,
      "{certificationCards.map((c) => ("
    );
    const certBlock = `{[
                {
                  title: "TÜV NORD Certified",
                  body:
                    "Independently tested and certified by TÜV NORD for IP55 protection and validated under extreme damp-heat and dry-heat performance conditions.",
                },
                {
                  title: "Simulated Sandstorm Testing",
                  body:
                    "Validated under 12 sandstorm events per year at a sand loading of 10 g/m² per cycle — the toughest desert-climate cleaning protocol.",
                },
                {
                  title: "Panel-Safe Verified",
                  body:
                    "Tested for micro-crack analysis, full electrical parameter evaluation, optical reflectance and ARC (Anti-Reflective Coating) preservation.",
                },
              ].map((c) => (`;
    if (s.includes(certBlock)) s = s.replace(certBlock, "{certificationCards.map((c) => (");
  }

  // Trust stats
  s = s.replace(
    /{\[\.\.\.tayproTrustedByStatsStrip\]\.map\(\(stat\) => \(/,
    "{[...tayproTrustedByStatsStrip].map((stat, idx) => ("
  );
  s = s.replace(
    /key={stat\.label}/,
    "key={idx}"
  );
  if (s.includes("{stat.label}") && !s.includes("trustStats.stat")) {
    s = s.replace("{stat.label}", "{t(`trustStats.stat${idx}.label`)}");
  }

  writeFileSync(path, s);
  console.log("patched model-t (partial — review motion.div)");
}

function patchCleaningService() {
  const path = join(
    root,
    "src/app/[locale]/solar-panel-cleaning-system/solar-panel-cleaning-service/page.tsx"
  );
  let s = readFileSync(path, "utf8");

  const DELIVERABLE_ICONS = "Route, Warehouse, FileBarChart, ShieldCheck";
  if (!s.includes("DELIVERABLE_KEYS")) {
    s = s.replace(
      `const BENEFIT_INDICES = ["0", "1", "2", "3", "4", "5"] as const;

export default async function`,
      `const BENEFIT_INDICES = ["0", "1", "2", "3", "4", "5"] as const;
const DELIVERABLE_KEYS = ["card0", "card1", "card2", "card3"] as const;
const OPEX_CAPEX_ROW_KEYS = ["row0", "row1", "row2", "row3"] as const;
const ADVANTAGE_CARD_KEYS = ["card0", "card1", "card2", "card3", "card4", "card5"] as const;

export default async function`
    );

    s = s.replace(
      `  const benefits = BENEFIT_INDICES.map((i) => t(\`benefits.\${i}\`));

  const allFaqs = opexServiceFaqs;

  return (`,
      `  const benefits = BENEFIT_INDICES.map((i) => t(\`benefits.\${i}\`));

  const deliverableCards = DELIVERABLE_KEYS.map((key, i) => ({
    icon: [Route, Warehouse, FileBarChart, ShieldCheck][i],
    title: t(\`deliverables.\${key}Title\`),
    body: t(\`deliverables.\${key}Body\`),
  }));

  const opexVsCapexRows = OPEX_CAPEX_ROW_KEYS.map((key) => ({
    topic: t(\`opexVsCapex.\${key}.t\`),
    opex: t(\`opexVsCapex.\${key}.opex\`),
    capex: t(\`opexVsCapex.\${key}.capex\`),
  }));

  const advantageCards = ADVANTAGE_CARD_KEYS.map((key) => ({
    title: t(\`advantages.\${key}Title\`),
    body: t(\`advantages.\${key}Body\`),
  }));

  const allFaqs = opexServiceFaqs;

  return (`
    );
  }

  // Overview
  s = s.replace(
    /Pay-per-outcome solar O&amp;M cleaning[\s\S]*?{\/\* Billing highlight \*\//,
    `{t("overview.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("overview.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <div>
                  {t("overview.p1Before")}
                  <strong>{t("overview.p1Strong")}</strong>
                  {t("overview.p1After")}
                  <strong>{t("overview.p1BillingStrong")}</strong>
                  {t("overview.p1Suffix")}
                </motion.div>
                <motion.div>
                  {t("overview.p2Before")}
                  <strong>{t("overview.p2StudyStrong")}</strong>
                  {t("overview.p2Mid")}
                  <strong>{t("overview.p2CyclesStrong")}</strong>
                  {t("overview.p2AfterCycles")}
                  <strong>{t("overview.p2PlanStrong")}</strong>
                  {t("overview.p2Mid2")}
                  <strong>{t("overview.p2RestStrong")}</strong>
                  {t("overview.p2AfterRest")}
                </motion.div>
                <motion.div>
                  {t("overview.p3Before")}
                  <strong>{t("overview.p3ReportsStrong")}</strong>
                  {t("overview.p3AfterReports")}
                  {tCommon("connectivitySummary")}
                  {t("overview.p3ConnectivitySuffix")}
                </motion.div>
                <motion.div>
                  {t("overview.p4Prefix")}
                  <Link
                    href="/blog/cost-benefit-analysis-of-solar-panel-cleaning-services-in-india"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("overview.linkBlogCost")}
                  </Link>
                  {t("overview.p4Mid")}
                  <Link
                    href="/blog/why-solar-power-plants-need-robotic-cleaning-for-maximum-roi"
                    className="text-[#A8C117] hover:underline"
                  >
                    {t("overview.linkBlogRoi")}
                  </Link>
                  {t("overview.p4Suffix")}
                </motion.div>
              </motion.div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Billing highlight */}`
  );

  s = s.replace(/<motion\.div/g, "<motion.div").replace(/<\/motion\.div>/g, "</motion.div>");
  s = s.replace(/<motion\.motion.div/g, "<motion.div").replace(/<\/motion\.motion.div>/g, "</motion.div>");

  writeFileSync(path, s);
  console.log("patched cleaning-service (review)");
}

patchModelT();
patchCleaningService();

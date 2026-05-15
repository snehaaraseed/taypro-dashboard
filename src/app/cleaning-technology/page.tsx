import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Cpu,
  Droplets,
  HardHat,
  Radio,
  Shield,
  Wind,
  Wrench,
} from "lucide-react";
import {
  robotProducts,
  robots,
  tayproMarketingImpactStats,
  tayproRobotConnectivitySummary,
  tayproTrustedByStatsStrip,
} from "@/app/data";
import { listAllBlogs } from "@/lib/cms/blogService";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { RobotCard } from "../components/RobotCard";
import CallbackCard from "../components/CallbackCard";
import { Container } from "../components/Container";
import { AnimateOnScroll } from "../components/AnimateOnScroll";
import FAQAccordion from "../components/FAQAccordion";
import { FAQPageSchema, HowToSchema } from "../components/StructuredData";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Cleaning technology", href: "" },
];

const siteUrl = SITE_URL;
const cleaningTechOg = socialImagesFromPreset("cleaningTech");

const technologyPillars = [
  {
    icon: Wind,
    title: "Patented dual-pass dry cleaning",
    description:
      "High-speed airflow lifts dry dust without scratching modules, then ultra-soft microfiber completes the wipe—no water tankers on site.",
  },
  {
    icon: Cpu,
    title: "AI-assisted cleaning schedules",
    description:
      "Robots adapt cycle cadence from weather, soiling, and fleet history—skipping wasted runs after rain and prioritising post-storm recovery.",
  },
  {
    icon: Radio,
    title: "Resilient fleet connectivity",
    description: `Telemetry and commands over ${tayproRobotConnectivitySummary}, with Taypro Console for scheduling, health, and audit-ready reporting.`,
  },
  {
    icon: Shield,
    title: "Built for harsh field duty",
    description:
      "Waterproof drives, anti-corrosion coatings, and modular layouts sized for utility blocks—from desert dust to coastal humidity.",
  },
] as const;

const audienceSegments = [
  {
    icon: Building2,
    title: "Developers & asset owners",
    description:
      "Protect performance ratio and tariff capture with predictable dry-cleaning cadence, documented cycles in Taypro Console, and CAPEX or Taypro Opex procurement models.",
    links: [
      { label: "ROI calculator", href: "/solar-panel-cleaning-robot-price-calculator" },
      { label: "Project case studies", href: "/projects" },
    ],
  },
  {
    icon: Wrench,
    title: "O&M and plant operators",
    description:
      "Replace labour-heavy washing with fleet schedules you can audit—same-day breakdown targets, pan-India spares, and remote diagnostics before trucks roll.",
    links: [
      { label: "Taypro Console", href: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app" },
      { label: "Contact support", href: "/contact" },
    ],
  },
  {
    icon: HardHat,
    title: "EPC & technical teams",
    description:
      "Specify robots by array type—fixed tilt, seasonal tilt, scattered blocks, or single-axis trackers—with connectivity and commissioning plans sized at design stage.",
    links: [
      { label: "Robot specifications", href: "/solar-panel-cleaning-system" },
      { label: "Cleaning technology FAQ", href: "#tech-faq-heading" },
    ],
  },
] as const;

const dualPassHowToSteps = [
  {
    name: "Airflow pass — lift dry dust",
    text: "High-speed controlled airflow dislodges loose dust and sand without abrasive contact on the module glass—reducing scratch risk compared with dry brushing alone.",
  },
  {
    name: "Microfiber pass — remove adhered residue",
    text: "Ultra-soft microfiber completes the wipe for pollen, agricultural film, or post-storm particulates that airflow alone cannot clear.",
  },
  {
    name: "AI-timed cycle on the row",
    text: "Automatic robots execute the dual-pass sequence along each row at controlled speed while Taypro Console logs the cycle for O&M audit trails.",
  },
  {
    name: "Fleet repeat on schedule",
    text: "Schedules adapt to weather and soiling—tighter cadence after dust events, paused cycles when rain makes cleaning redundant—so performance ratio stays stable through the season.",
  },
] as const;

const cleaningMethodComparison = [
  {
    factor: "Water consumption",
    manual: "High (tankers, scheduling)",
    semiAuto: "None (dry)",
    autonomous: "None (dry)",
  },
  {
    factor: "Labour at 50–250 MW",
    manual: "Large crews, inconsistent",
    semiAuto: "Crew places robot per row",
    autonomous: "Minimal — fleet runs rows",
  },
  {
    factor: "Cleaning cadence",
    manual: "Weekly/monthly at best",
    semiAuto: "Daily possible on blocks",
    autonomous: "Daily/alternate-day fleet-wide",
  },
  {
    factor: "Soiling recovery",
    manual: "Variable by crew & season",
    semiAuto: "99%+ dust per pass (Model-B)",
    autonomous: "99%+ dust per cycle (Model-A/T)",
  },
  {
    factor: "Fleet visibility",
    manual: "Paper logs, if any",
    semiAuto: "Limited telemetry",
    autonomous: "Taypro Console + connectivity",
  },
  {
    factor: "Best fit",
    manual: "Small sites, water-available",
    semiAuto: "Scattered blocks, mixed layout",
    autonomous: "Utility fixed-tilt & trackers",
  },
] as const;

const technicalSnapshot = [
  { label: "Cleaning method", value: "Patented dual-pass dry (airflow + microfiber)" },
  { label: "Water required", value: "None — waterless O&M" },
  { label: "Typical dust removal", value: "99%+ per automated cycle (platform-dependent)" },
  { label: "Scheduling", value: "AI/ML-informed cycles via Taypro Console" },
  {
    label: "Connectivity",
    value: tayproRobotConnectivitySummary,
  },
  { label: "Certification", value: "TÜV NORD validated platforms (field deployments)" },
  { label: "Manufacturing", value: "Chakan, Pune — Made in India" },
  { label: "Service", value: "Pan-India spares, same-day breakdown targets" },
] as const;

/** Prefer these slugs when published; remaining slots fill from newest posts. */
const PREFERRED_TECH_BLOG_SLUGS = [
  "what-is-a-solar-panel-cleaning-robot",
  "microfiber-vs-traditional-brushes-why-taypros-patented-dual-pass-solar-panel-cleaning-system-outperforms",
  "the-complete-guide-to-solar-panel-maintenance",
  "what-are-the-different-methods-used-for-solar-panel-cleaning",
  "benefits-of-using-solar-panel-cleaning-robot-in-a-solar-plant",
  "how-to-calculate-a-performance-ratio-of-a-solar-plant",
  "how-ai-can-improve-solar-energy-output",
  "cost-benefit-analysis-of-solar-panel-cleaning-services-in-india",
] as const;

async function getLatestProjects(limit = 3) {
  const projects = await getAllFileProjects();
  return [...projects]
    .sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    )
    .slice(0, limit);
}

async function getBlogPostsForTechPage(limit = 6) {
  const all = await listAllBlogs(false);
  const bySlug = new Map(all.map((b) => [b.slug, b]));
  const picked: (typeof all)[number][] = [];

  for (const slug of PREFERRED_TECH_BLOG_SLUGS) {
    const post = bySlug.get(slug);
    if (post) picked.push(post);
    if (picked.length >= limit) break;
  }

  for (const post of all) {
    if (picked.length >= limit) break;
    if (!picked.some((p) => p.slug === post.slug)) picked.push(post);
  }

  return picked.slice(0, limit).map((b) => ({
    title: b.title,
    description: b.description,
    href: `/blog/${b.slug}`,
    date: new Date(b.updatedAt || b.publishDate).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    image:
      b.featuredImage && b.featuredImage.trim() !== "" ? b.featuredImage : null,
  }));
}

type DeepDiveSection = {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: ReactNode[];
  bullets?: string[];
  image: string;
  imageAlt: string;
  reverse: boolean;
};

const deepDiveSections: DeepDiveSection[] = [
  {
    id: "dual-pass",
    eyebrow: "Core methodology",
    title: "Dual-pass waterless solar panel cleaning",
    paragraphs: [
      "Soiling is the silent tax on Indian utility-scale PV: dust films can suppress generation by double-digit percentages in arid and agricultural belts before O&M teams mobilise manual crews. Taypro’s patented approach treats cleaning as a two-stage mechanical process tuned for dry climates—not a hose-down adapted for robots.",
      "Pass one uses controlled airflow to lift loose particulates without dragging grit across the glass. Pass two follows with microfiber contact to remove adhered residue—the combination field teams rely on after agricultural dust, pollen, or post-storm events.",
      "Because the first pass is non-contact, modules see less abrasive wear over years of daily cleaning than with stiff brushes or uncontrolled dry wiping. That matters when asset owners model 25-year degradation and warranty exposure on glass.",
      <>
        The method is documented across{" "}
        <Link href="/projects" className="text-[#5a8f00] font-medium hover:underline">
          live utility projects
        </Link>{" "}
        and explored in our{" "}
        <Link
          href="/blog/microfiber-vs-traditional-brushes-why-taypros-patented-dual-pass-solar-panel-cleaning-system-outperforms"
          className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
        >
          dual-pass vs traditional brushes
        </Link>{" "}
        guide—without water, thermal shock, or tanker logistics.
      </>,
    ],
    bullets: [
      "No water procurement or runoff compliance on site",
      "Suitable for fixed tilt, seasonal tilt, rooftop, and tracker rows (platform-dependent)",
      "Documented 99%+ dust removal per cycle on automatic platforms",
    ],
    image: "/tayprosolarpanel/taypro-about1.jpg",
    imageAlt:
      "Taypro waterless solar panel cleaning robot operating on a utility-scale PV array",
    reverse: false,
  },
  {
    id: "ai-scheduling",
    eyebrow: "Intelligent automation",
    title: "AI and ML for predictable O&M",
    paragraphs: [
      "Cleaning robots only create value when they run at the right time. Taypro automatic platforms ingest weather forecasts, historical soiling patterns, and fleet telemetry to decide when to clean, pause, or accelerate cycles.",
      "After heavy rain, robots stand down to conserve charge and avoid redundant passes. Following dust storms or harvest seasons, schedules tighten so performance ratio recovers before the next revenue-critical period.",
      "Predictive maintenance hooks in the same data stream: battery health, motor loads, and fault codes surface in Console before they become multi-day outages—supporting Taypro’s same-day breakdown response commitment on deployed fleets.",
      <>
        Operators monitor outcomes in{" "}
        <Link
          href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
          className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
        >
          Taypro Console
        </Link>
        —scheduling, battery health, cycle logs, and alerts in one dashboard for multi-block sites. Read how{" "}
        <Link
          href="/blog/how-ai-can-improve-solar-energy-output"
          className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
        >
          AI improves solar output
        </Link>{" "}
        in field operations.
      </>,
    ],
    bullets: [
      "Weather-aware pause and resume logic",
      "Cycle history for PR and warranty discussions",
      "Integration with pan-India service and spares network",
    ],
    image: "/tayproasset/taypro-console.png",
    imageAlt: "Taypro Console fleet monitoring for solar panel cleaning robots",
    reverse: true,
  },
  {
    id: "connectivity",
    eyebrow: "Fleet operations",
    title: "Connectivity sized per plant",
    paragraphs: [
      `Large sites rarely have uniform network coverage. Taypro engineers deploy ${tayproRobotConnectivitySummary} so robots stay reachable across blocks—whether that means LTE backhaul, Wi-Fi at the substation, hybrid RF mesh through rows, or LoRa where long-range low-power links fit.`,
      "Real-time telemetry shortens mean time to repair: faults surface in Console before they become multi-day outages, and field teams arrive with the right spares.",
      "Mesh-style links help when a single gateway cannot cover hundreds of hectares—robots relay status row-to-row while backhaul carries aggregated fleet data to the cloud.",
      <>
        See how connectivity maps to each robot platform on the{" "}
        <Link
          href="/solar-panel-cleaning-system"
          className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
        >
          solar panel cleaning robots hub
        </Link>
        ,{" "}
        <Link
          href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
          className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
        >
          automatic robot specs
        </Link>
        , and{" "}
        <Link
          href="/blog/how-are-pv-panel-cleaning-robots-installed"
          className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
        >
          installation guide
        </Link>
        .
      </>,
    ],
    bullets: [
      "Site-specific network design at commissioning",
      "Secure telemetry path to Taypro Console",
      "Remote diagnostics before truck rolls",
    ],
    image: "/tayproasset/robots.png",
    imageAlt:
      "Taypro automatic, semi-automatic, and tracker solar panel cleaning robots",
    reverse: false,
  },
  {
    id: "field-hardware",
    eyebrow: "Engineering",
    title: "Hardware built for Indian field conditions",
    paragraphs: [
      "Utility plants in India face dust storms, monsoon humidity, coastal salt, and wide temperature swings—consumer-grade robotics do not survive that calendar. Taypro platforms use waterproof drives, corrosion-resistant materials, and modular sub-assemblies sized for rapid swap in the field.",
      "Model-T adds tracker-specific mechanics: flexible bridge geometry and rotation across single-axis brands so one cleaning head traverses table-to-table without manual repositioning every few metres.",
      "Manufacturing and QA run from Chakan, Pune with capacity to produce hundreds of robots per month—so fleet expansions and spare pipelines keep pace with multi-hundred-MW rollouts.",
    ],
    bullets: [
      "TÜV NORD certified robot platforms",
      "Modular design for commissioning and spares",
      "Compatible with major tracker ecosystems (Model-T)",
    ],
    image: "/tayprosolarpanel/taypro-about2.webp",
    imageAlt:
      "Taypro engineering and manufacturing for solar panel cleaning robots",
    reverse: true,
  },
];

const technologyFaqs = [
  {
    question: "Do Taypro solar panel cleaning robots use water?",
    answer:
      "No. Taypro robots use a patented dual-pass dry method—airflow plus microfiber—so plants avoid water procurement, runoff management, and module thermal shock common with wet washing in arid regions.",
  },
  {
    question: "What is dual-pass cleaning and why two stages?",
    answer:
      "The first pass dislodges dry dust with airflow to minimise contact with the glass surface. The second pass uses microfiber to remove finer or sticky residue. Together they deliver thorough cleaning without abrasives that can micro-scratch modules over time.",
  },
  {
    question: "How much soiling can robotic cleaning recover on utility plants?",
    answer:
      "Soiling loss varies by region and season—often cited in the 8–25% range on Indian utility plants when washing is infrequent. Taypro deployments target 99%+ dust removal per cycle on automatic platforms with schedules tight enough to stabilise performance ratio; exact gains depend on your baseline soiling and tariff.",
  },
  {
    question: "How does AI change when robots actually clean?",
    answer:
      "Scheduling logic considers weather forecasts, recent soiling events, and fleet history. Robots may pause during effective rain and prioritise cleaning after dust storms or high-soiling seasons—reducing wasted cycles and aligning O&M with generation risk.",
  },
  {
    question: "What connectivity options do Taypro robots support?",
    answer: `Deployments use ${tayproRobotConnectivitySummary} depending on site layout and backhaul. Taypro sizes the architecture during commissioning so Taypro Console receives telemetry and can push schedules reliably across the plant.`,
  },
  {
    question: "Are Taypro robots suitable for single-axis trackers?",
    answer:
      "Yes. Model-T is engineered for tracker rows with a flexible bridge and rotation across brands. Model-A targets fixed and seasonal-tilt arrays; Model-B covers portable crew-assisted blocks. Compare platforms on the solar panel cleaning system hub.",
  },
  {
    question: "How is Taypro different from manual wet washing?",
    answer:
      "Manual wet washing needs water logistics, large crews, and typically lower cadence on MW-scale sites. Taypro robots run waterless dual-pass cycles on a predictable schedule with Console visibility—reducing labour variance and improving repeatability through dust season.",
  },
  {
    question: "What certifications apply to Taypro cleaning robots?",
    answer:
      "Taypro robot platforms are field-validated with TÜV NORD certification on applicable models. Patents cover core cleaning system technology. Specifications and certificates are listed on each product page under the solar panel cleaning system section.",
  },
  {
    question: "Can Taypro operate robots for us instead of CAPEX purchase?",
    answer:
      "Yes. Taypro Opex is an operator-led model—pay per panel cleaned with Taypro running the fleet on your plant. Technology is the same dual-pass dry platform; economics differ. Discuss both models during site assessment.",
  },
  {
    question: "How can I validate ROI before buying robots?",
    answer:
      "Use the free solar panel cleaning robot ROI calculator, review case studies under Projects, then contact Taypro with your layout for a site-specific robot count, quote, and service SLA.",
  },
];

const exploreLinks = [
  { label: "Solar cleaning robots", href: "/solar-panel-cleaning-system" },
  { label: "ROI calculator", href: "/solar-panel-cleaning-robot-price-calculator" },
  { label: "Live projects", href: "/projects" },
  { label: "Contact Taypro", href: "/contact" },
] as const;

export const metadata: Metadata = {
  title:
    "Solar Panel Cleaning Robot Technology | Waterless Dual-Pass — Taypro",
  description:
    "How Taypro waterless solar panel cleaning robots work: patented dual-pass dry cleaning (99%+ dust per cycle), AI scheduling, fleet connectivity, field deployments across India, method comparison vs manual washing, and TÜV NORD certified platforms.",
  keywords: [
    "solar panel cleaning robot technology",
    "waterless solar panel cleaning",
    "dual-pass solar cleaning",
    "dry solar panel cleaning robot",
    "AI solar panel cleaning",
    "solar robot connectivity",
    "taypro cleaning technology",
  ],
  openGraph: {
    title: "Solar Panel Cleaning Robot Technology — Taypro",
    description:
      "Patented dual-pass waterless cleaning, AI scheduling, and fleet connectivity for utility-scale solar in India.",
    url: `${siteUrl}/cleaning-technology`,
    type: "website",
    ...cleaningTechOg.openGraph,
  },
  twitter: {
    title: "Solar Panel Cleaning Robot Technology — Taypro",
    description:
      "Waterless dual-pass cleaning, AI scheduling, and Taypro Console fleet monitoring.",
    ...cleaningTechOg.twitter,
  },
  alternates: {
    canonical: `${siteUrl}/cleaning-technology`,
  },
};

export default async function CleaningTechnologyPage() {
  const [latestProjects, techBlogPosts] = await Promise.all([
    getLatestProjects(3),
    getBlogPostsForTechPage(6),
  ]);

  return (
    <>
      <FAQPageSchema faqs={technologyFaqs} />
      <HowToSchema
        name="How Taypro dual-pass waterless solar panel cleaning works"
        description="Two-stage dry cleaning for utility-scale solar: airflow dust removal, microfiber finish, and AI-scheduled fleet cycles via Taypro Console."
        steps={[...dualPassHowToSteps]}
        totalTime="PT15M"
        image="/tayprosolarpanel/taypro-about1.jpg"
      />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-start overflow-x-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/tayprobglayout/taypro-bg.png')" }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-white/92 sm:bg-white/88"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/55 to-[#f4f7f9]"
            aria-hidden
          />

          <AnimateOnScroll
            animation="fadeInUp"
            className="relative z-20 pt-10 px-4 sm:px-6 max-w-4xl mx-auto pb-12 md:pb-16 text-center"
          >
            <p className="text-[#A8C117] text-sm mb-4 uppercase tracking-wide font-medium">
              Waterless · AI-scheduled · Fleet-connected
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 leading-tight text-balance">
              Solar panel cleaning robot technology
            </h1>
            <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-pretty">
              Taypro engineers autonomous and semi-automatic{" "}
              <strong className="font-medium text-[#052638]">
                solar panel cleaning robots
              </strong>{" "}
              for dusty utility-scale sites in India—combining patented dual-pass
              dry cleaning, intelligent schedules, and{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                Taypro Console
              </Link>{" "}
              so O&amp;M teams recover generation without water logistics.
            </p>
          </AnimateOnScroll>
        </section>

        {/* Stats */}
        <section
          className="w-full py-10 md:py-12 bg-[#052638] border-y border-white/10"
          aria-label="Taypro technology impact"
        >
          <Container>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 70}
                  className="px-2"
                >
                  <p className="text-[#A8C117] font-semibold text-2xl sm:text-3xl md:text-4xl mb-1">
                    {stat.value}
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm">{stat.label}</p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Pillars */}
        <section
          className="py-14 md:py-20 bg-white"
          aria-labelledby="tech-pillars-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                Platform overview
              </p>
              <h2
                id="tech-pillars-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                What powers Taypro cleaning robots
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Hardware, software, and connectivity designed together—so
                performance ratio gains are repeatable, not dependent on crew
                availability or tanker schedules.
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {technologyPillars.map((pillar, idx) => (
                <AnimateOnScroll
                  key={pillar.title}
                  animation="fadeInUp"
                  delay={idx * 70}
                >
                  <article className="h-full rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 hover:border-[#A8C117]/60 hover:shadow-sm transition">
                    <pillar.icon
                      className="w-8 h-8 text-[#5a8f00] mb-4"
                      aria-hidden
                    />
                    <h3 className="text-[#052638] font-semibold text-lg mb-2 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-[#27415c] text-sm leading-relaxed">
                      {pillar.description}
                    </p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Who this is for */}
        <section
          className="py-14 md:py-20 bg-[#052638]"
          aria-labelledby="audience-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                Who this is for
              </p>
              <h2
                id="audience-heading"
                className="text-white font-semibold text-3xl md:text-4xl mb-4"
              >
                Built for every stakeholder in the plant lifecycle
              </h2>
              <p className="text-white/85 text-lg leading-relaxed">
                Whether you underwrite generation, run daily O&amp;M, or
                engineer the array—Taypro&apos;s cleaning technology maps to
                your decisions on budget, uptime, and long-term module care.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {audienceSegments.map((segment, idx) => (
                <AnimateOnScroll
                  key={segment.title}
                  animation="fadeInUp"
                  delay={idx * 70}
                >
                  <article className="flex flex-col h-full rounded-2xl border border-white/15 bg-white/5 p-6 hover:border-[#A8C117]/50 transition">
                    <segment.icon
                      className="w-8 h-8 text-[#A8C117] mb-4"
                      aria-hidden
                    />
                    <h3 className="text-white font-semibold text-lg mb-3 leading-snug">
                      {segment.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed flex-1 mb-5">
                      {segment.description}
                    </p>
                    <ul className="space-y-2">
                      {segment.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A8C117] hover:underline"
                          >
                            {link.label}
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Soiling context */}
        <section
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="soiling-context-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="mb-8">
              <h2
                id="soiling-context-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                Why soiling matters on Indian utility plants
              </h2>
              <div className="space-y-4 text-[#27415c] text-base md:text-lg leading-relaxed">
                <p>
                  Dust, pollen, and agricultural particulates settle on modules
                  within days in many states—long before manual crews can cover
                  every block. Uncleaned arrays lose irradiance, drag down
                  performance ratio, and create uncomfortable conversations
                  between O&amp;M and asset owners during peak tariff months.
                </p>
                <p>
                  Wet washing at 100 MW scale competes for water, labour, and
                  daylight. Tanker schedules slip; crews skip rows; and
                  inconsistent cadence leaves soiling losses baked into annual
                  budgets. That is why developers increasingly specify{" "}
                  <Link
                    href="/solar-panel-cleaning-system"
                    className="text-[#5a8f00] font-medium hover:underline"
                  >
                    solar panel cleaning robots
                  </Link>{" "}
                  as core O&amp;M infrastructure—not an optional add-on.
                </p>
                <p>
                  Taypro&apos;s technology stack targets repeatable dry
                  cleaning: remove dust without water, log every cycle, and
                  tighten schedules when the weather turns harsh. The sections
                  below explain dual-pass mechanics, AI timing, connectivity, and
                  the hardware that survives real field duty.
                </p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* How dual-pass works */}
        <section
          id="how-dual-pass-works"
          className="py-14 md:py-20 bg-white"
          aria-labelledby="how-dual-pass-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                Step by step
              </p>
              <h2
                id="how-dual-pass-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                How dual-pass dry cleaning works
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                A four-stage waterless cycle executed on each row—designed to
                maximise dust removal while limiting abrasive contact with module
                glass.
              </p>
            </AnimateOnScroll>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {dualPassHowToSteps.map((step, idx) => (
                <AnimateOnScroll
                  key={step.name}
                  animation="fadeInUp"
                  delay={idx * 60}
                >
                  <li className="flex gap-4 rounded-2xl border border-gray-200 bg-[#f8fafb] p-6 h-full list-none">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#052638] text-[#A8C117] font-semibold text-sm"
                      aria-hidden
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-[#052638] font-semibold text-lg mb-2">
                        {step.name}
                      </h3>
                      <p className="text-[#27415c] text-sm leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </li>
                </AnimateOnScroll>
              ))}
            </ol>
          </Container>
        </section>

        {/* Method comparison */}
        <section
          className="py-14 md:py-20 bg-[#052638]"
          aria-labelledby="method-comparison-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <h2
                id="method-comparison-heading"
                className="text-white font-semibold text-3xl md:text-4xl mb-4"
              >
                Cleaning method comparison
              </h2>
              <p className="text-white/85 text-lg leading-relaxed">
                How autonomous Taypro robots compare to manual wet washing and
                semi-automatic dry platforms for utility-scale O&amp;M in India.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={80}>
              <div className="overflow-x-auto rounded-2xl border border-white/15 shadow-lg">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="bg-white/10 text-white">
                      <th className="px-4 py-3 font-semibold">Factor</th>
                      <th className="px-4 py-3 font-semibold">Manual wet</th>
                      <th className="px-4 py-3 font-semibold">
                        Semi-auto dry (Model-B)
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        Autonomous dry (Model-A / T)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {cleaningMethodComparison.map((row) => (
                      <tr
                        key={row.factor}
                        className="bg-white/5 text-white/90"
                      >
                        <th className="px-4 py-3 font-medium text-[#A8C117]">
                          {row.factor}
                        </th>
                        <td className="px-4 py-3">{row.manual}</td>
                        <td className="px-4 py-3">{row.semiAuto}</td>
                        <td className="px-4 py-3">{row.autonomous}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Deep dives */}
        {deepDiveSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={`py-14 md:py-20 ${
              section.reverse ? "bg-[#f4f7f9]" : "bg-white"
            }`}
            aria-labelledby={`${section.id}-heading`}
          >
            <Container>
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center ${
                  section.reverse ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <AnimateOnScroll
                  animation={section.reverse ? "fadeInRight" : "fadeInLeft"}
                  className="relative aspect-[4/3] w-full max-w-xl mx-auto lg:max-w-none rounded-2xl overflow-hidden shadow-lg ring-1 ring-gray-200/80 bg-[#0a2a38]"
                >
                  <Image
                    src={section.image}
                    alt={section.imageAlt}
                    fill
                    className={
                      section.image.includes("console")
                        ? "object-contain object-center p-6 bg-[#e8eef4]"
                        : section.image.includes("robots.png")
                          ? "object-contain object-center p-4"
                          : "object-cover object-center"
                    }
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </AnimateOnScroll>

                <AnimateOnScroll
                  animation={section.reverse ? "fadeInLeft" : "fadeInRight"}
                  delay={80}
                >
                  <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                    {section.eyebrow}
                  </p>
                  <h2
                    id={`${section.id}-heading`}
                    className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4 leading-tight"
                  >
                    {section.title}
                  </h2>
                  <div className="space-y-4 text-[#27415c] text-base leading-relaxed">
                    {section.paragraphs.map((para, i) =>
                      typeof para === "string" ? (
                        <p key={i}>{para}</p>
                      ) : (
                        <div key={i}>{para}</div>
                      )
                    )}
                    {section.bullets && section.bullets.length > 0 ? (
                      <ul className="space-y-2 pt-2">
                        {section.bullets.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check
                              className="w-4 h-4 text-[#5a8f00] mt-0.5 shrink-0"
                              aria-hidden
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </AnimateOnScroll>
              </div>
            </Container>
          </section>
        ))}

        {/* Waterless impact */}
        <section
          className="py-14 md:py-20 bg-[#052638]"
          aria-labelledby="waterless-impact-heading"
        >
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <AnimateOnScroll animation="fadeInUp">
                <Droplets
                  className="w-10 h-10 text-[#A8C117] mb-4"
                  aria-hidden
                />
                <h2
                  id="waterless-impact-heading"
                  className="text-white font-semibold text-3xl md:text-4xl mb-4 leading-tight"
                >
                  Waterless O&amp;M at utility scale
                </h2>
                <p className="text-white/85 text-lg leading-relaxed mb-4">
                  Manual wet washing competes for scarce water, labour, and
                  daylight windows. Taypro robots eliminate tanker dependency
                  while keeping cleaning cycles predictable through dust
                  seasons.
                </p>
                <p className="text-white/80 text-base leading-relaxed mb-6">
                  Taypro deployments have contributed to saving{" "}
                  <strong className="text-[#A8C117] font-semibold">
                    {tayproMarketingImpactStats.waterSavedAnnually.value}{" "}
                    {tayproMarketingImpactStats.waterSavedAnnually.label.toLowerCase()}
                  </strong>{" "}
                  across customer fleets—while supporting{" "}
                  <strong className="text-white font-semibold">
                    {tayproMarketingImpactStats.robotCapacityDeployed.value}
                  </strong>{" "}
                  of robot capacity in the field.
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-[#A8C117] font-medium hover:underline"
                >
                  Browse field case studies
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeInRight" delay={80}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Robot capacity deployed",
                      value: tayproMarketingImpactStats.robotCapacityDeployed
                        .value,
                    },
                    {
                      label: "Plant installations",
                      value: tayproMarketingImpactStats.plantInstallations
                        .value,
                    },
                    {
                      label: "CO₂ reduced annually",
                      value: tayproMarketingImpactStats.co2ReducedAnnually.value,
                    },
                    {
                      label: "Monthly manufacturing capacity",
                      value:
                        tayproMarketingImpactStats.robotsManufacturedPerMonth
                          .value,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/15 bg-white/5 px-5 py-4 text-center"
                    >
                      <p className="text-[#A8C117] text-2xl font-semibold mb-1">
                        {item.value}
                      </p>
                      <p className="text-white/75 text-xs sm:text-sm">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        {/* Technical snapshot */}
        <section
          className="py-14 md:py-20 bg-white border-t border-gray-100"
          aria-labelledby="tech-snapshot-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                At a glance
              </p>
              <h2
                id="tech-snapshot-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                Taypro cleaning technology snapshot
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Key attributes asset managers and EPC teams review when
                specifying robotic dry cleaning for MW-scale plants.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={80}>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {technicalSnapshot.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl border border-gray-200 bg-[#f8fafb] px-5 py-4"
                  >
                    <dt className="text-[#5a7a8f] text-xs font-medium uppercase tracking-wider mb-1">
                      {row.label}
                    </dt>
                    <dd className="text-[#052638] text-sm font-medium leading-relaxed">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Field proof */}
        <section
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="field-proof-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                Field proof
              </p>
              <h2
                id="field-proof-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                Technology deployed on utility-scale plants
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Dual-pass dry cleaning, automatic fleets, and Console monitoring
                across multi-MW installations in India—documented as project
                case studies.
              </p>
            </AnimateOnScroll>
            {latestProjects.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {latestProjects.map((project, idx) => (
                <AnimateOnScroll
                  key={project.id}
                  animation="fadeInUp"
                  delay={idx * 70}
                >
                  <Link
                    href={project.href}
                    className="group flex flex-col h-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:border-[#A8C117] hover:shadow-md transition"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#eef3f8]">
                      <Image
                        src={project.img}
                        alt={`${project.title} — Taypro solar panel cleaning robot deployment`}
                        fill
                        className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[#052638] font-semibold text-lg mb-2 group-hover:text-[#5a8f00] transition-colors">
                        {project.title}
                      </h3>
                      {project.details.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {project.details.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex text-xs font-medium bg-[#A8C117]/15 text-[#052638] px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <span className="mt-auto text-[#5a8f00] text-sm font-medium inline-flex items-center gap-1">
                        Read case study
                        <ArrowRight className="w-4 h-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
            <AnimateOnScroll
              animation="fadeInUp"
              delay={200}
              className="mt-8 text-center"
            >
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline"
              >
                View all projects
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </AnimateOnScroll>
            </>
            ) : null}
          </Container>
        </section>

        {/* Related guides — from CMS */}
        {techBlogPosts.length > 0 && (
          <section
            className="py-14 md:py-20 bg-white"
            aria-labelledby="related-guides-heading"
          >
            <Container>
              <AnimateOnScroll
                animation="fadeInUp"
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 max-w-5xl mx-auto"
              >
                <div className="text-center sm:text-left">
                  <h2
                    id="related-guides-heading"
                    className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
                  >
                    Deeper reading on cleaning &amp; O&amp;M
                  </h2>
                  <p className="text-[#27415c] text-lg leading-relaxed">
                    Guides from the Taypro blog on robots, soiling, economics,
                    and plant performance—updated as new articles publish.
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 text-[#5a8f00] font-medium hover:underline shrink-0 mx-auto sm:mx-0"
                >
                  View all articles
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </AnimateOnScroll>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {techBlogPosts.map((post, idx) => (
                  <AnimateOnScroll
                    key={post.href}
                    animation="fadeInUp"
                    delay={idx * 50}
                  >
                    <Link
                      href={post.href}
                      className="group flex flex-col h-full rounded-xl border border-gray-200 bg-[#f8fafb] overflow-hidden hover:border-[#A8C117] hover:shadow-sm transition"
                    >
                      <div className="relative aspect-[16/10] bg-[#eef3f8]">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={`${post.title} — Taypro blog`}
                            fill
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
                        ) : null}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <time className="text-xs text-[#5a8f00] font-medium mb-2">
                          {post.date}
                        </time>
                        <h3 className="text-[#052638] font-semibold text-base mb-2 leading-snug line-clamp-2 group-hover:text-[#5a8f00] transition-colors">
                          {post.title}
                        </h3>
                        {post.description ? (
                          <p className="text-[#27415c] text-sm leading-relaxed line-clamp-3 flex-1">
                            {post.description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Robot lineup */}
        <section
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="tech-robots-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center max-w-3xl mx-auto mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                Product platforms
              </p>
              <h2
                id="tech-robots-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                Robots built on this technology
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Automatic, semi-automatic, and tracker-ready platforms share the
                same dry-cleaning DNA—configured per array type.{" "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  Compare all robots
                </Link>
                .
              </p>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {robotProducts.map((robot, idx) => (
                <AnimateOnScroll
                  key={robot.model}
                  animation="fadeInUp"
                  delay={idx * 70}
                  className="h-full"
                >
                  <RobotCard
                    robot={robot}
                    priority={idx === 0}
                    preferGenericTitle
                  />
                </AnimateOnScroll>
              ))}
            </div>

            <AnimateOnScroll
              animation="fadeInUp"
              delay={200}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              {robots.slice(3).map((r) => (
                <Link
                  key={r.model}
                  href={r.href}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f8fafb] px-4 py-2.5 text-sm font-medium text-[#052638] hover:border-[#A8C117] hover:text-[#5a8f00] transition"
                >
                  {r.marketingName ?? r.model}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              ))}
            </AnimateOnScroll>
          </Container>
        </section>

        {/* FAQ */}
        <section
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="tech-faq-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2
                id="tech-faq-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                Technology FAQs
              </h2>
              <p className="text-[#27415c] text-lg">
                Common questions about Taypro dry cleaning, AI scheduling, and
                fleet connectivity.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={80}>
              <FAQAccordion faqs={technologyFaqs} variant="modern" />
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Explore */}
        <section className="py-12 md:py-14 bg-white border-t border-gray-100">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-8"
            >
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-2">
                Explore next
              </h2>
              <p className="text-[#27415c]">
                Quotes, ROI, and project proof points for your plant.
              </p>
            </AnimateOnScroll>
            <div className="flex flex-wrap justify-center gap-3">
              {exploreLinks.map((link, idx) => (
                <AnimateOnScroll key={link.href} animation="fadeInUp" delay={idx * 50}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-[#052638] hover:border-[#A8C117] hover:text-[#5a8f00] shadow-sm transition"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <CallbackCard
          headerText="Discuss cleaning technology for your plant"
        />
      </div>
    </>
  );
}

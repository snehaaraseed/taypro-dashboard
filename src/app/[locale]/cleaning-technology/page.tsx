import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
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
  robotSolutions,
  tayproMarketingImpactStats,
  tayproRobotConnectivitySummary,
  tayproTrustedByStatsStrip,
} from "@/app/data";
import { listAllBlogs } from "@/lib/cms/blogService";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { RobotCard } from "@/app/components/RobotCard";
import CallbackCard from "@/app/components/CallbackCard";
import ModuleManufacturerTrust from "@/app/components/ModuleManufacturerTrust";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema, HowToSchema } from "@/app/components/StructuredData";
import { socialImagesFromPreset } from "@/lib/seo/open-graph";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { PerformanceMethodologyNotice } from "@/app/components/PerformanceMethodologyNotice";
import {
  HARDWARE_ROBOTS_GRID_HOME,
  hardwareRobotsGridItemClass,
} from "@/lib/products/robot-grid-layout";

const CLEANING_TECH_PATH = "/cleaning-technology";
const siteUrl = SITE_URL;
const cleaningTechOg = socialImagesFromPreset("cleaningTech");

const PILLAR_ICONS = [Wind, Cpu, Radio, Shield] as const;
const AUDIENCE_ICONS = [Building2, Wrench, HardHat] as const;
const AUDIENCE_LINK_HREFS = [
  ["/solar-panel-cleaning-robot-price-calculator", "/projects"],
  [
    "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    "/contact",
  ],
  ["/solar-panel-cleaning-system", "#tech-faq-heading"],
] as const;

const DEEP_DIVE_CONFIG = [
  { id: "dual-pass", image: "/tayprosolarpanel/taypro-about1.jpg", reverse: false, key: "dualPass" as const },
  { id: "ai-scheduling", image: "/tayproasset/nectyr.png", reverse: true, key: "aiScheduling" as const },
  { id: "connectivity", image: "/tayproasset/robots.png", reverse: false, key: "connectivity" as const },
  { id: "field-hardware", image: "/tayprosolarpanel/taypro-about2.webp", reverse: true, key: "fieldHardware" as const },
] as const;

const COMPARISON_ROW_KEYS = ["row0", "row1", "row2", "row3", "row4", "row5"] as const;
const FAQ_KEYS = ["q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"] as const;
const EXPLORE_HREFS = [
  "/solar-panel-cleaning-system",
  "/solar-panel-cleaning-robot-price-calculator",
  "/projects",
  "/contact",
] as const;
const STAT_LABEL_KEYS = ["label0", "label1", "label2", "label3"] as const;
const SNAPSHOT_ROW_KEYS = ["row0", "row1", "row2", "row3", "row4", "row5", "row6", "row7"] as const;

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
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, limit);
}

function blogDateLocale(locale: string) {
  if (locale === "hi") return "hi-IN";
  if (locale === "ar") return "ar";
  if (locale === "ja") return "ja-JP";
  if (locale === "bn") return "bn-IN";
  return "en-IN";
}

async function getBlogPostsForTechPage(locale: string, limit = 6) {
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
    date: new Date(b.updatedAt || b.publishDate).toLocaleDateString(blogDateLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    image: b.featuredImage && b.featuredImage.trim() !== "" ? b.featuredImage : null,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CleaningTechnologyPage.meta" });
  const keywords = [
    t("keyword0"),
    t("keyword1"),
    t("keyword2"),
    t("keyword3"),
    t("keyword4"),
    t("keyword5"),
    t("keyword6"),
    t("keyword7"),
    t("keyword8"),
    t("keyword9"),
  ];
  return withHreflang(CLEANING_TECH_PATH, locale, {
    title: t("title"),
    description: t("description"),
    keywords,
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${CLEANING_TECH_PATH}`,
      type: "website",
      ...cleaningTechOg.openGraph,
    },
    twitter: {
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      ...cleaningTechOg.twitter,
    },
  });
}

export default async function CleaningTechnologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CleaningTechnologyPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const connectivity = tayproRobotConnectivitySummary;

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumb"), href: "" },
  ];

  const technologyPillars = PILLAR_ICONS.map((icon, i) => ({
    icon,
    title: t(`pillars.item${i}.title`),
    description: t(`pillars.item${i}.description`, { connectivity }),
  }));

  const audienceSegments = AUDIENCE_ICONS.map((icon, i) => ({
    icon,
    title: t(`audience.segment${i}.title`),
    description: t(`audience.segment${i}.description`),
    links: [
      { label: t(`audience.segment${i}.link0`), href: AUDIENCE_LINK_HREFS[i][0] },
      { label: t(`audience.segment${i}.link1`), href: AUDIENCE_LINK_HREFS[i][1] },
    ],
  }));

  const dualPassHowToSteps = [0, 1, 2, 3].map((i) => ({
    name: t(`schema.howToStep${i}Name`),
    text: t(`schema.howToStep${i}Text`),
  }));

  const cleaningMethodComparison = COMPARISON_ROW_KEYS.map((rowKey) => ({
    factor: t(`comparison.${rowKey}.factor`),
    manual: t(`comparison.${rowKey}.manual`),
    semiAuto: t(`comparison.${rowKey}.semiAuto`),
    autonomous: t(`comparison.${rowKey}.autonomous`),
  }));

  const technicalSnapshot = SNAPSHOT_ROW_KEYS.map((rowKey) => ({
    label: t(`snapshot.${rowKey}Label`),
    value: rowKey === "row4" ? connectivity : t(`snapshot.${rowKey}Value`),
  }));

  const technologyFaqs = FAQ_KEYS.map((qKey, i) => ({
    question: t(`faq.${qKey}`),
    answer: t(`faq.a${i}`, { connectivity }),
  }));

  const exploreLinks = EXPLORE_HREFS.map((href, i) => ({
    label: t(`explore.link${i}`),
    href,
  }));

  const waterlessStats = [
    tayproMarketingImpactStats.robotCapacityDeployed,
    tayproMarketingImpactStats.plantInstallations,
    tayproMarketingImpactStats.co2ReducedAnnually,
    tayproMarketingImpactStats.robotsManufacturedPerMonth,
  ].map((stat, i) => ({ value: stat.value, label: t(`waterless.stat${i}Label`) }));

  function buildDeepDiveParagraphs(key: (typeof DEEP_DIVE_CONFIG)[number]["key"]): ReactNode[] {
    const base = `deepDive.${key}`;
    if (key === "dualPass") {
      return [
        t(`${base}.p0`), t(`${base}.p1`), t(`${base}.p2`),
        <>
          {t(`${base}.p3Before`)}{" "}
          <Link href="/projects" className="text-[#5a8f00] font-medium hover:underline">{t(`${base}.projectsLink`)}</Link>{" "}
          {t(`${base}.p3Mid`)}{" "}
          <Link href="/blog/microfiber-vs-traditional-brushes-why-taypros-patented-dual-pass-solar-panel-cleaning-system-outperforms" className="text-[#5a8f00] font-medium underline-offset-4 hover:underline">{t(`${base}.blogLink`)}</Link>{" "}
          {t(`${base}.p3After`)}
        </>,
      ];
    }
    if (key === "aiScheduling") {
      return [
        t(`${base}.p0`), t(`${base}.p1`), t(`${base}.p2`),
        <>
          {t(`${base}.p3Before`)}{" "}
          <Link href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app" className="text-[#5a8f00] font-medium underline-offset-4 hover:underline">{t(`${base}.nectyrLink`)}</Link>
          {t(`${base}.p3Mid`)}{" "}
          <Link href="/blog/how-ai-can-improve-solar-energy-output" className="text-[#5a8f00] font-medium underline-offset-4 hover:underline">{t(`${base}.aiBlogLink`)}</Link>{" "}
          {t(`${base}.p3After`)}
        </>,
      ];
    }
    if (key === "connectivity") {
      return [
        t(`${base}.p0`, { connectivity }), t(`${base}.p1`), t(`${base}.p2`),
        <>
          {t(`${base}.p3Before`)}{" "}
          <Link href="/solar-panel-cleaning-system" className="text-[#5a8f00] font-medium underline-offset-4 hover:underline">{t(`${base}.hubLink`)}</Link>
          {t(`${base}.p3Mid1`)}{" "}
          <Link href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system" className="text-[#5a8f00] font-medium underline-offset-4 hover:underline">{t(`${base}.autoSpecsLink`)}</Link>
          {t(`${base}.p3Mid2`)}{" "}
          <Link href="/blog/how-are-pv-panel-cleaning-robots-installed" className="text-[#5a8f00] font-medium underline-offset-4 hover:underline">{t(`${base}.installLink`)}</Link>
          {t(`${base}.p3After`)}
        </>,
      ];
    }
    return [t(`${base}.p0`), t(`${base}.p1`), t(`${base}.p2`)];
  }

  const deepDiveSections = DEEP_DIVE_CONFIG.map((cfg) => ({
    id: cfg.id,
    eyebrow: t(`deepDive.${cfg.key}.eyebrow`),
    title: t(`deepDive.${cfg.key}.title`),
    paragraphs: buildDeepDiveParagraphs(cfg.key),
    bullets: [0, 1, 2].map((i) => t(`deepDive.${cfg.key}.bullet${i}`)),
    image: cfg.image,
    imageAlt: t(`deepDive.${cfg.key}.imageAlt`),
    reverse: cfg.reverse,
  }));

  const [latestProjects, techBlogPosts] = await Promise.all([
    getLatestProjects(3),
    getBlogPostsForTechPage(locale, 6),
  ]);

  return (
    <>
      <FAQPageSchema faqs={technologyFaqs} />
      <HowToSchema
        name={t("schema.howToName")}
        description={t("schema.howToDescription")}
        steps={dualPassHowToSteps}
        totalTime="PT15M"
        image="/tayprosolarpanel/taypro-about1.jpg"
      />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <div className="relative flex flex-col items-center justify-start overflow-x-hidden">
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
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 leading-tight text-balance">
              {t("hero.title")}
            </h1>
            <p className="text-[#22405a] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-pretty">
              {t("hero.bodyBeforeStrong")}{" "}
              <strong className="font-medium text-[#052638]">
                {t("hero.bodyStrong")}
              </strong>{" "}
              {t("hero.bodyMid")}{" "}
              <Link
                href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t("hero.nectyrLink")}
              </Link>{" "}
              {t("hero.bodyAfter")}
            </p>
          </AnimateOnScroll>
        </div>

        {/* Stats */}
        <div
          className="w-full py-10 md:py-12 bg-[#052638] border-y border-white/10"
          aria-label={t("stats.ariaLabel")}
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
                  <p className="text-white/80 text-xs sm:text-sm">{t(`stats.${STAT_LABEL_KEYS[idx]}`)}</p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </div>

        {/* Pillars */}
        <div
          className="py-14 md:py-20 bg-white"
          aria-labelledby="tech-pillars-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-12"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("pillars.eyebrow")}
              </p>
              <h2
                id="tech-pillars-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("pillars.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("pillars.intro")}
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
        </div>

        {/* {t("audience.eyebrow")} */}
        <div
          className="py-14 md:py-20 bg-[#052638]"
          aria-labelledby="audience-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("audience.eyebrow")}
              </p>
              <h2
                id="audience-heading"
                className="text-white font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("audience.heading")}
              </h2>
              <p className="text-white/85 text-lg leading-relaxed">
                {t("audience.intro")}
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
        </div>

        {/* Soiling context */}
        <div
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="soiling-context-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="mb-8">
              <h2
                id="soiling-context-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("soiling.heading")}
              </h2>
              <div className="space-y-4 text-[#27415c] text-base md:text-lg leading-relaxed">
                <p>{t("soiling.p0")}</p>
                <p>
                  {t("soiling.p1Before")}{" "}
                  <Link
                    href="/solar-panel-cleaning-system"
                    className="text-[#5a8f00] font-medium hover:underline"
                  >
                    {t("soiling.p1Link")}
                  </Link>{" "}
                  {t("soiling.p1After")}
                </p>
                <p>{t("soiling.p2")}</p>
              </div>
            </AnimateOnScroll>
          </Container>
        </div>

        {/* How dual-pass works */}
        <div
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
                {t("dualPass.eyebrow")}
              </p>
              <h2
                id="how-dual-pass-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("dualPass.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("dualPass.intro")}
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
        </div>

        {/* Method comparison */}
        <div
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
                {t("comparison.heading")}
              </h2>
              <p className="text-white/85 text-lg leading-relaxed">
                {t("comparison.intro")}
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={80}>
              <div className="overflow-x-auto rounded-2xl border border-white/15 shadow-lg">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="bg-white/10 text-white">
                      <th className="px-4 py-3 font-semibold">{t("comparison.colFactor")}</th>
                      <th className="px-4 py-3 font-semibold">{t("comparison.colManual")}</th>
                      <th className="px-4 py-3 font-semibold">
                        {t("comparison.colSemiAuto")}
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        {t("comparison.colAutonomous")}
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
            <AnimateOnScroll animation="fadeInUp" delay={120} className="mt-6 max-w-3xl mx-auto">
              <PerformanceMethodologyNotice variant="dark" />
            </AnimateOnScroll>
          </Container>
        </div>

        {/* Deep dives */}
        {deepDiveSections.map((section) => (
          <div
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
          </div>
        ))}

        <ModuleManufacturerTrust />

        {/* Waterless impact */}
        <div
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
                  {t("waterless.heading")}
                </h2>
                <p className="text-white/85 text-lg leading-relaxed mb-4">
                  {t("waterless.p0")}
                </p>
                <p className="text-white/80 text-base leading-relaxed mb-6">
                  {t("waterless.p1Before")}{" "}
                  <strong className="text-[#A8C117] font-semibold">
                    {tayproMarketingImpactStats.waterSavedAnnually.value}{" "}
                    {t(`stats.${STAT_LABEL_KEYS[2]}`).toLowerCase()}
                  </strong>{" "}
                  {t("waterless.p1After")}{" "}
                  <strong className="text-white font-semibold">
                    {tayproMarketingImpactStats.robotCapacityDeployed.value}
                  </strong>{" "}
                  {t("waterless.p1End")}
                </p>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-[#A8C117] font-medium hover:underline"
                >
                  {t("waterless.caseStudiesLink")}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </AnimateOnScroll>

              <AnimateOnScroll animation="fadeInRight" delay={80}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {waterlessStats.map((item) => (
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
        </div>

        {/* Technical snapshot */}
        <div
          className="py-14 md:py-20 bg-white border-t border-gray-100"
          aria-labelledby="tech-snapshot-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("snapshot.eyebrow")}
              </p>
              <h2
                id="tech-snapshot-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("snapshot.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("snapshot.intro")}
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
            <AnimateOnScroll animation="fadeInUp" delay={120} className="mt-8 max-w-3xl mx-auto">
              <PerformanceMethodologyNotice />
            </AnimateOnScroll>
          </Container>
        </div>

        {/* {t("fieldProof.eyebrow")} */}
        <div
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="field-proof-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="max-w-3xl mx-auto text-center mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                {t("fieldProof.eyebrow")}
              </p>
              <h2
                id="field-proof-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("fieldProof.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("fieldProof.intro")}
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
                        alt={`${project.title}${t("fieldProof.projectImageAltSuffix")}`}
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
                        {t("fieldProof.readCaseStudy")}
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
                {t("fieldProof.viewAllProjects")}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </AnimateOnScroll>
            </>
            ) : null}
          </Container>
        </div>

        {/* Related guides, from CMS */}
        {techBlogPosts.length > 0 && (
          <div
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
                    {t("relatedGuides.heading")}
                  </h2>
                  <p className="text-[#27415c] text-lg leading-relaxed">
                    {t("relatedGuides.intro")}
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 text-[#5a8f00] font-medium hover:underline shrink-0 mx-auto sm:mx-0"
                >
                  {t("relatedGuides.viewAllArticles")}
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
                            alt={`${post.title}${t("relatedGuides.blogImageAltSuffix")}`}
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
          </div>
        )}

        {/* Robot lineup */}
        <div
          className="py-14 md:py-20 bg-[#f4f7f9]"
          aria-labelledby="tech-robots-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center max-w-3xl mx-auto mb-10"
            >
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("robots.eyebrow")}
              </p>
              <h2
                id="tech-robots-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                {t("robots.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("robots.introBefore")}{" "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  {t("robots.compareLink")}
                </Link>
                {t("robots.introAfter")}
              </p>
            </AnimateOnScroll>

            <div className={HARDWARE_ROBOTS_GRID_HOME}>
              {robotProducts.map((robot, idx) => (
                <AnimateOnScroll
                  key={robot.model}
                  animation="fadeInUp"
                  delay={idx * 70}
                  className={hardwareRobotsGridItemClass(idx, "home")}
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
              {robotSolutions.map((r) => (
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
        </div>

        <FaqSection
          id="tech-faq-heading"
          title={t("faq.heading")}
          subtitle={t("faq.intro")}
          faqs={technologyFaqs}
          tone="muted"
        />

        {/* Explore */}
        <div className="py-12 md:py-14 bg-white border-t border-gray-100">
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="text-center mb-8"
            >
              <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-2">
                {t("explore.heading")}
              </h2>
              <p className="text-[#27415c]">
                {t("explore.intro")}
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
        </div>

        <CallbackCard
          headerText={t("callback.header")}
        />
      </div>
    </>
  );
}

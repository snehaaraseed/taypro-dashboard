import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { FEATURED_HUB_PROJECT_SLUGS } from "@/lib/cms/projects-hub-config";
import {
  enrichProjectsForGrid,
  getProjectsBySlugs,
} from "@/lib/cms/projectService";
import { tayproTrustedByStatsStrip } from "@/app/data";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import {
  CollectionPageSchema,
  FAQPageSchema,
  ItemListSchema,
} from "@/app/components/StructuredData";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import ProjectsGrid from "@/app/components/ProjectsGrid";
import CallbackCard from "@/app/components/CallbackCard";
import { FaqSection } from "@/app/components/FaqSection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const PROJECT_CATEGORY_KEYS = [
  { key: "automatic" as const, href: "/projects/automatic" },
  { key: "semiAutomatic" as const, href: "/projects/semi-automatic" },
  { key: "capex" as const, href: "/projects/capex" },
];

const STAT_LABEL_KEYS = [
  "robotCapacityLabel",
  "co2ReducedLabel",
  "waterSavedLabel",
  "robotsManufacturedLabel",
] as const;

const FAQ_KEYS = ["q0", "q1", "q2", "q3"] as const;

function SectionLabel({
  label,
  counter,
  tone = "light",
}: {
  label: string;
  counter?: string;
  tone?: "light" | "dark";
}) {
  const textClass =
    tone === "dark" ? "text-white/70" : "text-[#27415c]";
  const counterClass =
    tone === "dark" ? "text-white/40" : "text-[#27415c]/50";

  return (
    <p
      className={`flex items-center gap-3 text-sm font-medium mb-5 ${textClass}`}
    >
      <span className="text-[#A8C117]" aria-hidden>
        •
      </span>
      <span className="uppercase tracking-[0.18em]">{label}</span>
      {counter ? (
        <span
          className={`${counterClass} tabular-nums tracking-normal normal-case`}
        >
          ({counter})
        </span>
      ) : null}
    </p>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const [allProjects, featuredBase] = await Promise.all([
    getAllFileProjects(locale),
    getProjectsBySlugs([...FEATURED_HUB_PROJECT_SLUGS], locale),
  ]);

  const featuredProjects = await enrichProjectsForGrid(featuredBase, locale);

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.projects"), href: "" },
  ];

  const projectsFaqs = FAQ_KEYS.map((qKey, i) => ({
    question: t(`faq.${qKey}`),
    answer: t(`faq.a${i}`),
  }));

  const itemListEntries = allProjects.map((p) => ({
    name: p.title,
    url: p.href,
    image: p.img.startsWith("http") ? p.img : p.img,
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <CollectionPageSchema
        name={t("schema.collectionName")}
        description={t("schema.collectionDescription")}
        siteUrl={siteUrl}
        url={`${siteUrl}/projects`}
      />
      <ItemListSchema
        scriptId="item-list-schema-projects-hub"
        name={t("schema.itemListName")}
        description={t("schema.itemListDescription")}
        items={itemListEntries}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={projectsFaqs} />

      <div className="min-h-screen overflow-x-hidden bg-white">
        {/* Hero */}
        <section className="relative border-b border-[#052638]/8">
          <div
            className="absolute inset-0 opacity-[0.04] bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: "url('/tayprobglayout/taypro-project.png')",
            }}
            aria-hidden
          />
          <Container className="relative py-16 md:py-24 lg:py-28">
            <AnimateOnScroll animation="fadeInUp" eager className="max-w-4xl">
              <SectionLabel label={t("hero.eyebrow")} />
              <h1 className="font-semibold text-[#052638] text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.08] tracking-tight mb-8">
                {t("hero.titleLine1")}
                <br />
                {t("hero.titleLine2")}
              </h1>
              <p className="text-[#27415c] text-lg md:text-xl leading-relaxed max-w-2xl">
                {t("hero.bodyBeforeLink")}{" "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("hero.bodyLink")}
                </Link>{" "}
                {t("hero.bodyAfterLink")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        {/* Stats */}
        <section className="w-full bg-[#052638]" aria-labelledby="projects-stats-heading">
          <Container className="py-12 md:py-14">
            <AnimateOnScroll animation="fadeInUp" className="mb-10 md:mb-12">
              <SectionLabel label={t("stats.eyebrow")} tone="dark" />
              <h2
                id="projects-stats-heading"
                className="text-white font-semibold text-2xl md:text-3xl max-w-2xl leading-snug"
              >
                {t("stats.heading")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-y-0 lg:divide-x lg:divide-white/10">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="lg:px-8 first:lg:pl-0 last:lg:pr-0"
                >
                  <div className="text-[#A8C117] font-semibold text-3xl sm:text-4xl md:text-[2.75rem] leading-none mb-3 tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-white/75 text-sm sm:text-base leading-relaxed max-w-[14rem]">
                    {t(`stats.${STAT_LABEL_KEYS[idx]}`)}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Categories */}
        <section
          className="w-full py-16 md:py-24 border-b border-[#052638]/8"
          aria-labelledby="browse-by-type-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="mb-12 md:mb-16">
              <SectionLabel label={t("categories.heading")} counter="01/01" />
              <p className="text-[#27415c] text-lg md:text-xl leading-relaxed max-w-2xl">
                {t("categories.intro")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#052638]/10">
              {PROJECT_CATEGORY_KEYS.map((cat, idx) => (
                <AnimateOnScroll
                  key={cat.href}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <Link
                    href={cat.href}
                    className="group flex flex-col h-full bg-white p-8 md:p-10 hover:bg-[#f4f7f9] transition-colors duration-300"
                  >
                    <span className="text-[#A8C117]/70 text-sm font-medium tabular-nums mb-6">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[#052638] font-semibold text-xl md:text-2xl mb-4 group-hover:text-[#5a8f00] transition-colors duration-300">
                      {t(`categories.${cat.key}.cardTitle`)}
                    </h3>
                    <p className="text-[#27415c] text-base leading-relaxed flex-1">
                      {t(`categories.${cat.key}.description`)}
                    </p>
                    <span className="mt-8 inline-flex items-center gap-2 text-[#5a8f00] font-medium text-sm group-hover:gap-3 transition-all duration-300">
                      {t(`categories.${cat.key}.viewLink`)}
                    </span>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Featured projects */}
        <section
          className="py-16 md:py-24 bg-[#f4f7f9] overflow-x-hidden"
          aria-labelledby="featured-projects-heading"
        >
          <Container>
            <AnimateOnScroll
              animation="fadeInUp"
              className="mb-12 md:mb-16 max-w-2xl"
            >
              <SectionLabel label={t("featured.heading")} counter="01/01" />
              <h2
                id="featured-projects-heading"
                className="sr-only"
              >
                {t("featured.heading")}
              </h2>
              <p className="text-[#27415c] text-lg md:text-xl leading-relaxed">
                {t("featured.body")}
              </p>
              <p className="mt-4 text-[#27415c]/80 text-sm md:text-base">
                {t("featured.countNote", {
                  shown: featuredProjects.length,
                  total: allProjects.length,
                })}
              </p>
            </AnimateOnScroll>
            <ProjectsGrid projects={featuredProjects} featuredFirst />
            <AnimateOnScroll animation="fadeInUp" className="mt-16 pt-10 border-t border-[#052638]/10">
              <p className="text-[#27415c] text-base md:text-lg mb-6">
                {t("featured.browseAllIntro")}
              </p>
              <div className="flex flex-wrap gap-3">
                {PROJECT_CATEGORY_KEYS.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="inline-flex items-center min-h-[44px] rounded-full border border-[#052638]/15 bg-white px-5 py-2 text-sm font-medium text-[#052638] hover:border-[#A8C117] hover:text-[#5a8f00] transition-colors duration-300"
                  >
                    {t(`categories.${cat.key}.cardTitle`)}
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-sm text-[#27415c]/70 leading-relaxed">
                {t("featured.bodyBeforeCleaningLink")}{" "}
                <Link
                  href="/cleaning-technology"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("featured.cleaningLink")}
                </Link>{" "}
                {t("featured.bodyMiddle")}{" "}
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator#calculator"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("featured.roiLink")}
                </Link>
                {t("featured.bodyAfter")}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        <FaqSection
          id="projects-faq-heading"
          title={t("faq.heading")}
          subtitle={t("faq.subheading")}
          faqs={projectsFaqs}
          footer={
            <Link
              href="/contact"
              className="inline-flex items-center justify-center min-h-[48px] bg-[#b2cb19] text-[#22405a] font-medium px-8 py-3 rounded-lg hover:bg-lime-500 transition"
            >
              {t("faq.cta")}
            </Link>
          }
        />

        <CallbackCard headerText={t("callback.header")} />
      </div>
    </>
  );
}

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
import {
  ProjectsPageHero,
  ProjectsSectionLabel,
} from "@/app/components/ProjectsPageHero";
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
  { key: "opex" as const, href: "/projects/opex" },
];

const STAT_LABEL_KEYS = [
  "robotCapacityLabel",
  "co2ReducedLabel",
  "waterSavedLabel",
  "robotsManufacturedLabel",
] as const;

const FAQ_KEYS = ["q0", "q1", "q2", "q3"] as const;

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

  const featuredSlugSet = new Set<string>(FEATURED_HUB_PROJECT_SLUGS);
  const portfolioBase = allProjects.filter((p) => !featuredSlugSet.has(p.id));
  const portfolioProjects = await enrichProjectsForGrid(portfolioBase, locale);

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
        <ProjectsPageHero
          tone="hub"
          eyebrow={t("hero.eyebrow")}
          projectCount={allProjects.length}
          countBadgeLabel={t("hero.countBadgeLabel")}
          countBadgeUnit={t("hero.countBadgeUnit")}
          title={
            <>
              {t("hero.titleLine1")}
              <span className="mt-2 block text-[#A8C117]">{t("hero.titleLine2")}</span>
            </>
          }
          lead={
            <>
              {t("hero.bodyBeforeLink")}{" "}
              <Link href="/solar-panel-cleaning-system">{t("hero.bodyLink")}</Link>{" "}
              {t("hero.bodyAfterLink")}
            </>
          }
          footer={
            <>
              {portfolioProjects.length > 0 ? (
                <a
                  href="#all-projects"
                  className="inline-flex min-h-[44px] items-center rounded-full bg-[#A8C117] px-5 py-2.5 text-sm font-semibold text-[#052638] transition hover:bg-[#b8d42a]"
                >
                  {t("featured.viewAllLink", { count: allProjects.length })}
                </a>
              ) : null}
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5"
              >
                {t("faq.cta")}
              </Link>
            </>
          }
        />

        {/* Stats */}
        <section
          className="relative z-10 -mt-6 border-b border-[#052638]/8 bg-[#f4f7f9] pb-4 pt-10 md:-mt-8 md:pb-6 md:pt-12"
          aria-labelledby="projects-stats-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="mb-8 md:mb-10">
              <ProjectsSectionLabel label={t("stats.eyebrow")} />
              <h2
                id="projects-stats-heading"
                className="max-w-2xl text-2xl font-semibold leading-snug text-[#052638] md:text-3xl"
              >
                {t("stats.heading")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="rounded-2xl border border-[#052638]/8 bg-white p-5 shadow-sm md:p-6"
                >
                  <div className="mb-2 text-3xl font-semibold tabular-nums leading-none text-[#A8C117] sm:text-4xl md:text-[2.5rem]">
                    {stat.value}
                  </div>
                  <div className="max-w-[14rem] text-sm leading-relaxed text-[#27415c] sm:text-base">
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
              <ProjectsSectionLabel label={t("categories.heading")} counter="01/04" />
              <p className="text-[#27415c] text-lg md:text-xl leading-relaxed max-w-2xl">
                {t("categories.intro")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
              {PROJECT_CATEGORY_KEYS.map((cat, idx) => (
                <AnimateOnScroll
                  key={cat.href}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <Link
                    href={cat.href}
                    className="group flex h-full flex-col rounded-2xl border border-[#052638]/10 bg-white p-8 shadow-sm transition-all duration-300 hover:border-[#A8C117]/40 hover:shadow-md md:p-9"
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
              <ProjectsSectionLabel label={t("featured.heading")} counter="01/01" />
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
                {portfolioProjects.length > 0 ? (
                  <>
                    {" "}
                    <a
                      href="#all-projects"
                      className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                    >
                      {t("featured.viewAllLink", { count: allProjects.length })}
                    </a>
                  </>
                ) : null}
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

        {/* Full portfolio */}
        {portfolioProjects.length > 0 ? (
          <section
            id="all-projects"
            className="py-16 md:py-24 bg-white border-t border-[#052638]/8 scroll-mt-24"
            aria-labelledby="all-projects-heading"
          >
            <Container>
              <AnimateOnScroll animation="fadeInUp" className="mb-12 md:mb-16 max-w-2xl">
                <ProjectsSectionLabel
                  label={t("portfolio.heading")}
                  counter={t("portfolio.countNote", { count: allProjects.length })}
                />
                <h2
                  id="all-projects-heading"
                  className="text-[#052638] font-semibold text-2xl md:text-3xl leading-snug mb-4"
                >
                  {t("portfolio.title")}
                </h2>
                <p className="text-[#27415c] text-lg md:text-xl leading-relaxed">
                  {t("portfolio.body")}
                </p>
              </AnimateOnScroll>
              <ProjectsGrid projects={portfolioProjects} columns={2} />
            </Container>
          </section>
        ) : null}

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

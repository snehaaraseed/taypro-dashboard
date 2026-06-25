import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { FEATURED_HUB_PROJECT_SLUGS } from "@/lib/cms/projects-hub-config";
import {
  PROJECTS_HUB_PORTFOLIO_PAGE_SIZE,
  parseProjectsHubPage,
  projectsHubPagePath,
  projectsHubPageUrl,
  projectsHubPaginationLinks,
} from "@/lib/cms/projects-hub-pagination";
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
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const PORTFOLIO_PAGE_SIZE = PROJECTS_HUB_PORTFOLIO_PAGE_SIZE;

const PROJECT_CATEGORY_KEYS = [
  { key: "automatic" as const, href: "/projects/automatic" },
  { key: "semiAutomatic" as const, href: "/projects/semi-automatic" },
  { key: "capex" as const, href: "/projects/capex" },
  { key: "opex" as const, href: "/projects/opex" },
];

const STAT_LABEL_KEYS = [
  "robotCapacityLabel",
  "panelsCleanedAnnuallyLabel",
  "waterSavedLabel",
  "robotsManufacturedLabel",
] as const;

const FAQ_KEYS = ["q0", "q1", "q2", "q3"] as const;

type ProjectPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string | string[] }>;
};

async function getPortfolioPageCount(locale: string): Promise<number> {
  const allProjects = await getAllFileProjects(locale);
  const featuredSlugSet = new Set<string>(FEATURED_HUB_PROJECT_SLUGS);
  const portfolioCount = allProjects.filter(
    (p) => !featuredSlugSet.has(p.id)
  ).length;
  return Math.max(1, Math.ceil(portfolioCount / PORTFOLIO_PAGE_SIZE));
}

export async function generateMetadata({
  params,
  searchParams,
}: ProjectPageProps): Promise<Metadata> {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const requestedPage = parseProjectsHubPage(sp.page);
  const totalPages = await getPortfolioPageCount(locale);
  const page = Math.min(requestedPage, totalPages);
  const t = await getTranslations({ locale, namespace: "ProjectsPage.meta" });

  const canonical = projectsHubPageUrl(siteUrl, page);
  const pagination = projectsHubPaginationLinks(siteUrl, page, totalPages);

  const title =
    page <= 1 ? t("title") : t("metaTitlePaged", { page });
  const description =
    page <= 1 ? t("description") : t("metaDescriptionPaged", { page });

  const listPath = projectsHubPagePath(page);
  const querySuffix = listPath.includes("?")
    ? listPath.slice(listPath.indexOf("?"))
    : "";

  return withHreflang(
    "/projects",
    locale,
    {
      title: { absolute: title },
      description,
      ...(pagination.previous || pagination.next
        ? {
            pagination: {
              ...(pagination.previous ? { previous: pagination.previous } : {}),
              ...(pagination.next ? { next: pagination.next } : {}),
            },
          }
        : {}),
      openGraph: {
        title,
        description,
        url: canonical,
        type: "website",
      },
    },
    { canonicalSuffix: querySuffix }
  );
}

export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const requestedPage = parseProjectsHubPage(sp.page);

  const t = await getTranslations({ locale, namespace: "ProjectsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const [allProjects, featuredBase] = await Promise.all([
    getAllFileProjects(locale),
    getProjectsBySlugs([...FEATURED_HUB_PROJECT_SLUGS], locale),
  ]);

  const featuredProjects = await enrichProjectsForGrid(featuredBase, locale);

  const featuredSlugSet = new Set<string>(FEATURED_HUB_PROJECT_SLUGS);
  const portfolioBase = allProjects.filter((p) => !featuredSlugSet.has(p.id));
  const totalPortfolioPages = Math.max(
    1,
    Math.ceil(portfolioBase.length / PORTFOLIO_PAGE_SIZE)
  );
  const portfolioPage = Math.min(requestedPage, totalPortfolioPages);
  const portfolioOffset = (portfolioPage - 1) * PORTFOLIO_PAGE_SIZE;
  const portfolioSlice = portfolioBase.slice(
    portfolioOffset,
    portfolioOffset + PORTFOLIO_PAGE_SIZE
  );
  const portfolioProjects = await enrichProjectsForGrid(portfolioSlice, locale);

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.projects"), href: "" },
  ];

  const projectsFaqs = FAQ_KEYS.map((qKey, i) => ({
    question: t(`faq.${qKey}`),
    answer: t(`faq.a${i}`),
  }));

  const schemaProjects =
    portfolioPage <= 1
      ? [...featuredProjects, ...portfolioProjects]
      : portfolioProjects;

  const itemListEntries = schemaProjects.map((p) => ({
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
        url={projectsHubPageUrl(siteUrl, portfolioPage)}
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
              <span className="mt-2 block">{t("hero.titleLine2")}</span>
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
              {portfolioBase.length > 0 ? (
                <a
                  href="#all-projects"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#A8C117] px-6 py-3 text-sm font-semibold text-[#052638] transition hover:bg-[#b3cf3d]"
                >
                  {t("featured.viewAllLink", { count: allProjects.length })}
                </a>
              ) : null}
              <Link
                href="/contact"
                className="inline-flex min-h-[44px] items-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-[#052638] transition hover:border-[#A8C117] hover:text-[#5a8f00]"
              >
                {t("faq.cta")}
              </Link>
            </>
          }
        />

        {/* Stats */}
        <section
          className="bg-[#f4f7f9] py-14 md:py-20"
          aria-labelledby="projects-stats-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="mb-10 text-center md:mb-12">
              <ProjectsSectionLabel label={t("stats.eyebrow")} />
              <h2
                id="projects-stats-heading"
                className="mx-auto max-w-2xl text-2xl font-semibold leading-snug text-[#052638] md:text-3xl"
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
                >
                  <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center shadow-sm transition hover:border-[#A8C117]/40 hover:shadow-md md:px-5 md:py-7">
                    <div className="mb-2 text-2xl font-semibold tabular-nums leading-none text-[#5a8f00] sm:text-3xl md:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mx-auto max-w-[14rem] text-xs leading-relaxed text-[#27415c] sm:text-sm">
                      {t(`stats.${STAT_LABEL_KEYS[idx]}`)}
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Categories */}
        <section
          className="w-full border-b border-gray-200/80 bg-white py-16 md:py-24"
          aria-labelledby="browse-by-type-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="mb-12 md:mb-16 max-w-2xl">
              <ProjectsSectionLabel label={t("categories.heading")} counter="01/04" />
              <h2 id="browse-by-type-heading" className="sr-only">
                {t("categories.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed md:text-xl">
                {t("categories.intro")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {PROJECT_CATEGORY_KEYS.map((cat, idx) => (
                <AnimateOnScroll
                  key={cat.href}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <Link
                    href={cat.href}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-[#f4f7f9] shadow-sm transition-all duration-300 hover:border-[#A8C117]/50 hover:shadow-lg"
                  >
                    <div className="border-b border-gray-100 bg-white px-6 py-5 md:px-7">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#A8C117]/15 text-sm font-semibold tabular-nums text-[#5a8f00]">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      <h3 className="mb-3 text-xl font-semibold text-[#052638] transition-colors duration-300 group-hover:text-[#5a8f00] md:text-2xl">
                        {t(`categories.${cat.key}.cardTitle`)}
                      </h3>
                      <p className="flex-1 text-base leading-relaxed text-[#27415c]">
                        {t(`categories.${cat.key}.description`)}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#5a8f00] transition-all duration-300 group-hover:gap-3">
                        {t(`categories.${cat.key}.viewLink`)}
                      </span>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Featured projects */}
        <section
          className="overflow-x-hidden bg-[#f4f7f9] py-16 md:py-24"
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
                {portfolioBase.length > 0 ? (
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
            <ProjectsGrid projects={featuredProjects} featuredFirst eagerImages />
            <AnimateOnScroll
              animation="fadeInUp"
              className="mt-16 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8"
            >
              <p className="mb-6 text-base text-[#27415c] md:text-lg">
                {t("featured.browseAllIntro")}
              </p>
              <div className="flex flex-wrap gap-3">
                {PROJECT_CATEGORY_KEYS.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="inline-flex min-h-[44px] items-center rounded-full border border-gray-200 bg-[#f4f7f9] px-5 py-2 text-sm font-medium text-[#052638] transition-colors duration-300 hover:border-[#A8C117] hover:bg-white hover:text-[#5a8f00]"
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

        {/* Full portfolio (paginated) */}
        {portfolioBase.length > 0 ? (
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
              {totalPortfolioPages > 1 ? (
                <nav
                  className="mt-12 flex flex-wrap items-center justify-center gap-4"
                  aria-label={t("portfolio.paginationLabel")}
                >
                  {portfolioPage > 1 ? (
                    <Link
                      href={projectsHubPagePath(portfolioPage - 1)}
                      className="inline-flex min-h-[44px] items-center rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-[#052638] transition hover:border-[#A8C117]"
                    >
                      {t("portfolio.paginationPrevious")}
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-[44px] items-center rounded-xl border border-gray-100 px-5 py-2 text-sm text-gray-400">
                      {t("portfolio.paginationPrevious")}
                    </span>
                  )}
                  <span className="text-sm text-[#27415c] tabular-nums">
                    {t("portfolio.paginationPageOf", {
                      page: portfolioPage,
                      totalPages: totalPortfolioPages,
                    })}
                  </span>
                  {portfolioPage < totalPortfolioPages ? (
                    <Link
                      href={projectsHubPagePath(portfolioPage + 1)}
                      className="inline-flex min-h-[44px] items-center rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-[#052638] transition hover:border-[#A8C117]"
                    >
                      {t("portfolio.paginationNext")}
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-[44px] items-center rounded-xl border border-gray-100 px-5 py-2 text-sm text-gray-400">
                      {t("portfolio.paginationNext")}
                    </span>
                  )}
                </nav>
              ) : null}
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

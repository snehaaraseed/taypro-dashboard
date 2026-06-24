import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { FaqSection } from "@/app/components/FaqSection";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import ProjectsGrid from "@/app/components/ProjectsGrid";
import { ProjectsCategoryNav } from "@/app/components/ProjectsCategoryNav";
import { ProjectsPageHero } from "@/app/components/ProjectsPageHero";
import {
  enrichProjectsForGrid,
  getProjectsByCategory,
  type ProjectCategoryFilter,
} from "@/lib/cms/projectService";
import {
  FAQPageSchema,
  ItemListSchema,
} from "@/app/components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export type ProjectsFilterVariant = ProjectCategoryFilter;

const SCHEMA_IDS: Record<ProjectsFilterVariant, string> = {
  automatic: "item-list-schema-projects-automatic",
  semiAutomatic: "item-list-schema-projects-semi-automatic",
  capex: "item-list-schema-projects-capex",
  opex: "item-list-schema-projects-opex",
};

const PRODUCT_LINKS: Record<ProjectsFilterVariant, string> = {
  automatic:
    "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  semiAutomatic:
    "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
  capex: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
  opex: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
};

const FAQ_KEYS = ["q0", "q1", "q2"] as const;
const HIGHLIGHT_KEYS = ["h0", "h1", "h2", "h3"] as const;

export default async function ProjectsFilterPage({
  variant,
  locale,
}: {
  variant: ProjectsFilterVariant;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "ProjectsFilterPage" });
  const tHub = await getTranslations({ locale, namespace: "ProjectsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const v = variant;
  const categoryProjects = await getProjectsByCategory(v, locale);
  const gridProjects = await enrichProjectsForGrid(categoryProjects, locale);

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbProjects"), href: "/projects" },
    { name: t(`${v}.breadcrumb`), href: "" },
  ];

  const itemListEntries = categoryProjects.map((card) => ({
    name: card.title,
    url: card.href,
    image: card.img,
  }));

  const faqs = FAQ_KEYS.map((qKey, i) => ({
    question: t(`${v}.faq.${qKey}`),
    answer: t(`${v}.faq.a${i}`),
  }));

  const categoryLabels: Record<ProjectCategoryFilter, string> = {
    automatic: tHub("categories.automatic.cardTitle"),
    semiAutomatic: tHub("categories.semiAutomatic.cardTitle"),
    capex: tHub("categories.capex.cardTitle"),
    opex: tHub("categories.opex.cardTitle"),
  };

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ItemListSchema
        scriptId={SCHEMA_IDS[v]}
        name={t(`${v}.schemaName`)}
        description={t(`${v}.schemaDescription`)}
        items={itemListEntries}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={faqs} />

      <div className="min-h-screen overflow-x-hidden bg-white">
        <ProjectsPageHero
          tone={v}
          eyebrow={t(`${v}.eyebrow`)}
          projectCount={categoryProjects.length}
          countBadgeLabel={t("countBadgeLabel")}
          countBadgeUnit={t("countBadgeUnit")}
          title={t(`${v}.title`)}
          lead={
            <>
              {t(`${v}.introP1Before`)}{" "}
              <Link href={PRODUCT_LINKS[v]}>{t(`${v}.introP1Link`)}</Link>{" "}
              {t(`${v}.introP1After`)}
            </>
          }
        />

        <section className="border-b border-gray-200/80 bg-[#f4f7f9] py-10 md:py-14">
          <Container>
            <ProjectsCategoryNav
              active={v}
              labels={categoryLabels}
              hubLabel={t("breadcrumbProjects")}
            />
            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
              <AnimateOnScroll animation="fadeInUp" className="lg:col-span-7">
                <p className="text-[#27415c] text-lg leading-relaxed md:text-xl">
                  {t(`${v}.introP2`)}
                </p>
                <p className="mt-5 text-[#27415c]/90 text-base leading-relaxed md:text-lg">
                  {t(`${v}.introP3Before`)}{" "}
                  <Link
                    href="/solar-panel-cleaning-robot-price-calculator#calculator"
                    className="font-medium text-[#5a8f00] underline-offset-4 hover:underline"
                  >
                    {t(`${v}.introP3CalculatorLink`)}
                  </Link>
                  {t(`${v}.introP3Middle`)}{" "}
                  <Link
                    href="/projects"
                    className="font-medium text-[#5a8f00] underline-offset-4 hover:underline"
                  >
                    {t(`${v}.introP3ProjectsLink`)}
                  </Link>
                  {t(`${v}.introP3After`)}
                </p>
                {t.has(`${v}.introP4`) ? (
                  <p className="mt-5 text-[#27415c]/90 text-base leading-relaxed md:text-lg">
                    {t(`${v}.introP4`)}
                  </p>
                ) : null}
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInUp"
                delay={100}
                className="lg:col-span-5"
              >
                <div className="rounded-2xl border border-[#052638]/10 bg-white p-6 shadow-sm md:p-8">
                  <h2 className="mb-5 text-lg font-semibold text-[#052638] md:text-xl">
                    {t(`${v}.highlightsHeading`)}
                  </h2>
                  <ul className="space-y-4">
                    {HIGHLIGHT_KEYS.map((key) => (
                      <li
                        key={key}
                        className="flex gap-3 text-sm leading-relaxed text-[#27415c] md:text-base"
                      >
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8C117]"
                          aria-hidden
                        />
                        <span>{t(`${v}.highlights.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        <section
          className="w-full py-14 md:py-20 bg-white"
          aria-labelledby="project-case-studies-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="mb-10 max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#A8C117]">
                {t(`${v}.breadcrumb`)}
              </p>
              <h2
                id="project-case-studies-heading"
                className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3"
              >
                {t(`${v}.gridHeading`)}
              </h2>
              <p className="text-[#6B7280] text-lg leading-relaxed">
                {t(`${v}.gridIntro`)}
              </p>
            </AnimateOnScroll>

            {gridProjects.length === 0 ? (
              <p className="text-[#6B7280] text-lg leading-relaxed max-w-3xl">
                {t("emptyGrid")}
              </p>
            ) : (
              <ProjectsGrid projects={gridProjects} columns={2} />
            )}
          </Container>
        </section>

        <section className="w-full border-t border-[#052638]/8 bg-[#f4f7f9] py-12 md:py-14">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="mb-4 text-center text-2xl font-semibold text-[#052638]">
                {t(`${v}.closingHeading`)}
              </h2>
              <p className="text-center text-lg leading-relaxed text-[#27415c]">
                {t(`${v}.closingBodyBeforeLink`)}{" "}
                <Link
                  href={PRODUCT_LINKS[v]}
                  className="font-medium text-[#5a8f00] underline-offset-4 hover:underline"
                >
                  {t(`${v}.closingProductLink`)}
                </Link>{" "}
                {t(`${v}.closingBodyMiddle`)}{" "}
                <Link
                  href="/contact"
                  className="font-medium text-[#5a8f00] underline-offset-4 hover:underline"
                >
                  {t(`${v}.closingContactLink`)}
                </Link>
                {t(`${v}.closingBodyAfter`)}
              </p>
            </AnimateOnScroll>
          </Container>
        </section>

        <FaqSection
          id={`projects-${v}-faq-heading`}
          title={t(`${v}.faq.heading`)}
          subtitle={t(`${v}.faq.subheading`)}
          faqs={faqs}
          tone="muted"
          footer={
            <Link
              href="/contact"
              className="inline-flex items-center justify-center min-h-[48px] bg-[#b2cb19] text-[#22405a] font-medium px-8 py-3 rounded-lg hover:bg-lime-500 transition"
            >
              {t(`${v}.faq.cta`)}
            </Link>
          }
        />
      </div>
    </>
  );
}

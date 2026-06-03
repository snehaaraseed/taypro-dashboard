import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProjectsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const projects = await getAllFileProjects(locale);

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.projects"), href: "" },
  ];

  const projectsFaqs = FAQ_KEYS.map((qKey, i) => ({
    question: t(`faq.${qKey}`),
    answer: t(`faq.a${i}`),
  }));

  const itemListEntries = projects.map((p) => ({
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

      <div className="min-h-screen overflow-x-hidden">
        <section className="relative min-h-[50vh] flex flex-col items-center justify-start overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/tayprobglayout/taypro-project.png')",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-white/90 sm:bg-white/85"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/75"
            aria-hidden
          />

          <AnimateOnScroll
            animation="fadeInUp"
            eager
            className="relative z-10 pt-10 px-4 max-w-4xl mx-auto pb-28"
          >
            <p className="text-[#A8C117] text-center text-[16px] mb-4 uppercase tracking-wide">
              {t("hero.eyebrow")}
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 text-center leading-tight">
              {t("hero.titleLine1")}
              <br />
              {t("hero.titleLine2")}
            </h1>
            <p className="text-[#22405a] text-center text-lg md:text-xl leading-relaxed">
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

          <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 md:h-40"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        <section className="w-full py-14 md:py-16 bg-[#052638]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                {t("stats.eyebrow")}
              </p>
              <h2 className="text-white font-semibold text-2xl md:text-3xl">
                {t("stats.heading")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="px-2"
                >
                  <div className="text-[#A8C117] font-semibold text-3xl sm:text-4xl mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm sm:text-base">
                    {t(`stats.${STAT_LABEL_KEYS[idx]}`)}
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section
          className="w-full py-14 md:py-16 bg-white"
          aria-labelledby="browse-by-type-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="browse-by-type-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("categories.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("categories.intro")}
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PROJECT_CATEGORY_KEYS.map((cat, idx) => (
                <AnimateOnScroll
                  key={cat.href}
                  animation="fadeInUp"
                  delay={idx * 100}
                >
                  <Link
                    href={cat.href}
                    className="group flex flex-col h-full rounded-lg border border-gray-200 bg-[#f8fafb] p-6 shadow-sm hover:border-[#A8C117] hover:shadow-md transition"
                  >
                    <h3 className="text-[#052638] font-semibold text-xl mb-3 group-hover:text-[#5a8f00] transition-colors">
                      {t(`categories.${cat.key}.cardTitle`)}
                    </h3>
                    <p className="text-[#27415c] text-base leading-relaxed flex-1">
                      {t(`categories.${cat.key}.description`)}
                    </p>
                    <span className="mt-4 text-[#5a8f00] font-medium text-sm group-hover:underline">
                      {t(`categories.${cat.key}.viewLink`)}
                    </span>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section
          className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#f4f7f9] overflow-x-hidden"
          aria-labelledby="featured-projects-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="featured-projects-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                {t("featured.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
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
            <ProjectsGrid projects={projects} />
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

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { FaqSection } from "@/app/components/FaqSection";
import {
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
};

const PRODUCT_LINKS: Record<ProjectsFilterVariant, string> = {
  automatic:
    "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  semiAutomatic:
    "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
  capex: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
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
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const v = variant;
  const categoryProjects = await getProjectsByCategory(v, locale);

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

      <section className="w-full pt-16 pb-10 bg-white">
        <Container>
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
            {t(`${v}.eyebrow`)}
          </p>
          <h1 className="text-[#052638] text-4xl md:text-5xl mb-6 font-semibold leading-tight">
            {t(`${v}.title`)}
          </h1>
          <div className="max-w-3xl space-y-4 text-[#27415c] text-lg leading-relaxed">
            <p>
              {t(`${v}.introP1Before`)}{" "}
              <Link
                href={PRODUCT_LINKS[v]}
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t(`${v}.introP1Link`)}
              </Link>{" "}
              {t(`${v}.introP1After`)}
            </p>
            <p>{t(`${v}.introP2`)}</p>
            <p>
              {t(`${v}.introP3Before`)}{" "}
              <Link
                href="/solar-panel-cleaning-robot-price-calculator#calculator"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t(`${v}.introP3CalculatorLink`)}
              </Link>
              {t(`${v}.introP3Middle`)}{" "}
              <Link
                href="/projects"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                {t(`${v}.introP3ProjectsLink`)}
              </Link>
              {t(`${v}.introP3After`)}
            </p>
          </div>
        </Container>
      </section>

      <section className="w-full py-10 bg-[#f4f7f9]">
        <Container>
          <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
            {t(`${v}.highlightsHeading`)}
          </h2>
          <ul className="list-disc list-inside space-y-2 text-[#27415c] text-base md:text-lg leading-relaxed max-w-3xl">
            {HIGHLIGHT_KEYS.map((key) => (
              <li key={key}>{t(`${v}.highlights.${key}`)}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section
        className="w-full py-14 bg-white"
        aria-labelledby="project-case-studies-heading"
      >
        <Container>
          <h2
            id="project-case-studies-heading"
            className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3"
          >
            {t(`${v}.gridHeading`)}
          </h2>
          <p className="text-[#6B7280] text-lg mb-10 max-w-3xl leading-relaxed">
            {t(`${v}.gridIntro`)}
          </p>

          {categoryProjects.length === 0 ? (
            <p className="text-[#6B7280] text-lg leading-relaxed max-w-3xl">
              {t("emptyGrid")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categoryProjects.map((card, idx) => (
                <Link
                  href={card.href}
                  key={card.id}
                  title={t("projectLinkTitle")}
                  className="block border border-gray-300 p-4 overflow-hidden group"
                >
                  <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
                    <Image
                      src={card.img}
                      alt={`${card.title} - ${t(`${v}.imageAltSuffix`)}`}
                      title={`${card.title} - ${t(`${v}.imageTitleSuffix`)}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                      priority={idx < 4}
                    />
                    <div className="absolute bottom-4 left-4 text-white flex flex-col transition-all duration-300">
                      <h3 className="text-sm font-semibold bg-opacity-10 px-3 transition-transform duration-300 group-hover:-translate-y-3">
                        {card.title}
                      </h3>
                      <p className="text-xs bg-opacity-60 px-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 text-white/90">
                        {card.date}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      <section className="w-full py-12 bg-white border-t border-gray-100">
        <Container size="narrow">
          <h2 className="text-[#052638] font-semibold text-2xl mb-4 text-center">
            {t(`${v}.closingHeading`)}
          </h2>
          <p className="text-[#27415c] text-lg leading-relaxed text-center">
            {t(`${v}.closingBodyBeforeLink`)}{" "}
            <Link
              href={PRODUCT_LINKS[v]}
              className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
            >
              {t(`${v}.closingProductLink`)}
            </Link>{" "}
            {t(`${v}.closingBodyMiddle`)}{" "}
            <Link
              href="/contact"
              className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
            >
              {t(`${v}.closingContactLink`)}
            </Link>
            {t(`${v}.closingBodyAfter`)}
          </p>
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
    </>
  );
}

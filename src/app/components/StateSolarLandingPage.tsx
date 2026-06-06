import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { FaqSection } from "@/app/components/FaqSection";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ProjectsCardServer from "@/app/components/ProjectsCardServer";
import {
  FAQPageSchema,
  PlaceSchema,
  ServiceSchema,
} from "@/app/components/StructuredData";
import { PROJECT_PLACE_BY_SLUG } from "@/app/data/projectPlaceSchema";
import { getProjectsBySlugs } from "@/lib/cms/projectService";
import {
  getStateLandingConfig,
  getSiblingStateIds,
  type StateLandingId,
  statePathById,
} from "@/lib/seo/state-landing-config";
import { PRICE_GUIDE_PATH } from "@/lib/seo/robot-price-guide";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const FAQ_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7"] as const;
const RESOURCE_LINK_KEYS = ["0", "1", "2"] as const;

type StateSolarLandingPageProps = {
  stateId: StateLandingId;
  locale: string;
};

export default async function StateSolarLandingPage({
  stateId,
  locale,
}: StateSolarLandingPageProps) {
  const config = getStateLandingConfig(stateId);
  const t = await getTranslations({ locale, namespace: "StateLandingsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const ns = stateId;
  const siblingStates = getSiblingStateIds(stateId);
  const featuredProjects = await getProjectsBySlugs(
    config.featuredSlugs,
    locale
  );

  const region = config.addressRegion;
  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`${ns}.faq.q${key}`),
    answer: t(`${ns}.faq.a${key}`),
  }));

  const resourceLinks = RESOURCE_LINK_KEYS.map((key) => ({
    title: t(`${ns}.resources.link${key}Title`),
    href: t(`${ns}.resources.link${key}Href`),
  }));

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("shared.breadcrumbs.hub"), href: "/solar-panel-cleaning-system" },
    { name: t(`${ns}.hero.title`), href: "" },
  ];

  const pageUrl = `${SITE_URL}${config.path}`;

  return (
    <>
      <ServiceSchema
        name={`Solar Panel Cleaning Robot Service — ${region}`}
        description={t(`${ns}.meta.description`)}
        serviceType="Solar Panel Cleaning Robot Supply & Service"
        areaServed={`${region}, India`}
        url={pageUrl}
      />
      {config.placeSchemaSlugs.map((slug) => {
        const place = PROJECT_PLACE_BY_SLUG[slug];
        if (!place) return null;
        return (
          <PlaceSchema
            key={slug}
            schemaId={place.schemaId}
            name={place.name}
            description={t(`${ns}.meta.description`)}
            addressLocality={place.addressLocality}
            addressRegion={place.addressRegion}
            latitude={place.latitude}
            longitude={place.longitude}
          />
        );
      })}
      <FAQPageSchema faqs={faqs} />
      <Breadcrumbs items={breadcrumbs} />

      <section className="relative bg-[#052638] text-white py-14 md:py-20 px-4 sm:px-6 overflow-hidden">
        <Container className="max-w-4xl relative z-10">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-4">
            {t(`${ns}.hero.eyebrow`)}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-5">
            {t(`${ns}.hero.title`)}
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
            {t(`${ns}.hero.subtitle`)}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href={PRICE_GUIDE_PATH}
              className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("shared.cta.priceGuide")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
            >
              {t("shared.cta.calculator")}
            </Link>
            <Link
              href="/contact"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
            >
              {t("shared.cta.contact")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <AnimateOnScroll animation="fadeInUp">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t(`${ns}.soiling.eyebrow`)}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-6">
              {t(`${ns}.soiling.heading`)}
            </h2>
            <div className="space-y-4 text-[#27415c] text-base leading-relaxed">
              <p>{t(`${ns}.soiling.p1`)}</p>
              <p>{t(`${ns}.soiling.p2`)}</p>
              <p>{t(`${ns}.soiling.p3`)}</p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-[#f4f7f9] px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("shared.models.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
            {t("shared.models.heading", { state: region })}
          </h2>
          <p className="text-[#27415c] text-base leading-relaxed mb-4">
            {t(`${ns}.models.body`)}
          </p>
          <p className="text-[#27415c] text-base leading-relaxed mb-4">
            {t(`${ns}.models.recommended`)}
          </p>
          <Link
            href="/solar-panel-cleaning-system"
            className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
          >
            {t("shared.models.linkHub")}
          </Link>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("shared.deployments.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-6">
            {t(`${ns}.deployments.heading`)}
          </h2>
          <div className="space-y-4 text-[#27415c] text-base leading-relaxed">
            <p>{t(`${ns}.deployments.p1`)}</p>
            <p>{t(`${ns}.deployments.p2`)}</p>
            <p>{t(`${ns}.deployments.p3`)}</p>
          </div>
          {featuredProjects.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-[#052638] font-semibold text-lg mb-3">
                {t("shared.deployments.linksHeading")}
              </h3>
              <ul className="space-y-2">
                {featuredProjects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={project.href}
                      className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
                    >
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6">
        <Container className="max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("shared.projects.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3">
              {t("shared.projects.heading", { state: region })}
            </h2>
            <p className="text-[#27415c] text-base">
              {t("shared.projects.subheading")}
            </p>
          </div>
          <ProjectsCardServer
            useFileProjects
            filter={config.projectFilter}
            featuredSlugs={config.featuredSlugs}
            limit={6}
            locale={locale}
          />
          <div className="text-center mt-8">
            <Link
              href="/projects"
              className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
            >
              {t("shared.cta.projects")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("shared.procurement.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
            {t(`${ns}.procurement.heading`)}
          </h2>
          <div className="space-y-4 text-[#27415c] text-base leading-relaxed">
            <p>{t(`${ns}.procurement.p1`)}</p>
            <p>{t(`${ns}.procurement.p2`)}</p>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-[#052638] text-white px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("shared.roiBand.eyebrow")}
          </p>
          <h2 className="font-semibold text-2xl md:text-3xl mb-4">
            {t(`${ns}.roiBand.heading`)}
          </h2>
          <div className="space-y-4 text-gray-300 text-base leading-relaxed mb-8">
            <p>{t(`${ns}.roiBand.p1`)}</p>
            <p>{t(`${ns}.roiBand.p2`)}</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href={PRICE_GUIDE_PATH}
              className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("shared.cta.priceGuide")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              href="/solar-panel-cleaning-robot-price-calculator#calculator"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
            >
              {t("shared.cta.calculator")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-[#f4f7f9] px-4 sm:px-6">
        <Container className="max-w-3xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("shared.resources.eyebrow")}
          </p>
          <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4">
            {t("shared.resources.heading", { state: region })}
          </h2>
          <ul className="space-y-3">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
                >
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FaqSection
        id={`state-${stateId}-faq`}
        title={t("shared.faq.heading")}
        subtitle={t("shared.faq.subheading", { state: region })}
        faqs={faqs}
        tone="muted"
      />

      <section className="py-10 bg-[#f4f7f9] px-4 sm:px-6 border-t border-gray-100">
        <Container className="max-w-3xl">
          <h2 className="text-[#052638] font-semibold text-xl mb-3">
            {t("shared.siblings.heading")}
          </h2>
          <p className="text-[#27415c] text-sm mb-4">{t("shared.siblings.intro")}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {siblingStates.map((siblingId) => (
              <li key={siblingId}>
                <Link
                  href={statePathById(siblingId)}
                  className="text-[#5a8f00] font-medium hover:underline underline-offset-4"
                >
                  {getStateLandingConfig(siblingId).addressRegion}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <RequestEstimateForm
        variant="fullPage"
        eyebrow={t("shared.quoteForm.topic", { state: region })}
        title={t("shared.quoteForm.title", { state: region })}
        messagePlaceholder={t("shared.quoteForm.subtitle", { state: region })}
      />
    </>
  );
}

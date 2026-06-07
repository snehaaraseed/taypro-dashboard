import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { FaqSection } from "@/app/components/FaqSection";
import { FAQPageSchema } from "@/app/components/StructuredData";
import { MINY_PRODUCT_PATH } from "@/lib/seo/cleaning-machine";

const FAQ_KEYS = ["0", "1", "2", "3", "4"] as const;

const MODEL_CARDS = [
  {
    titleKey: "models.glydeTitle",
    bodyKey: "models.glydeBody",
    ctaKey: "models.ctaGlyde",
    href: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
  },
  {
    titleKey: "models.nyumaTitle",
    bodyKey: "models.nyumaBody",
    ctaKey: "models.ctaNyuma",
    href: "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot",
  },
  {
    titleKey: "models.helyxTitle",
    bodyKey: "models.helyxBody",
    ctaKey: "models.ctaHelyx",
    href: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
  },
  {
    titleKey: "models.rooftopTitle",
    bodyKey: "models.rooftopBody",
    ctaKey: "models.ctaRooftop",
    href: MINY_PRODUCT_PATH,
  },
] as const;

const EXPLORE_LINKS = [
  { labelKey: "explore.linkHub", href: "/solar-panel-cleaning-system" },
  { labelKey: "explore.linkTechnology", href: "/cleaning-technology" },
  { labelKey: "explore.linkPrice", href: "/solar-panel-cleaning-robot-price-india" },
  {
    labelKey: "explore.linkCompareManual",
    href: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
  },
  { labelKey: "explore.linkCompareSolabot", href: "/compare/taypro-vs-solabot" },
] as const;

export default async function CleaningMachinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CleaningMachinePage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`faq.q${key}`),
    answer: t(`faq.a${key}`),
  }));

  return (
    <>
      <FAQPageSchema faqs={faqs} />
      <Breadcrumbs items={breadcrumbs} />

      <section className="bg-[#052638] text-white py-14 md:py-20 px-4 sm:px-6">
        <Container className="max-w-4xl">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-4">
            {t("hero.eyebrow")}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-5">
            {t("hero.title")}
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/solar-panel-cleaning-system"
              className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg bg-[#A8C117] text-[#052638] font-semibold hover:bg-[#b3cf3d] transition-colors"
            >
              {t("hero.ctaHub")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-white/30 text-white font-medium hover:border-[#A8C117] hover:text-[#A8C117] transition-colors"
            >
              {t("hero.ctaQuote")}
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-white px-4 sm:px-6">
        <Container className="max-w-4xl">
          <AnimateOnScroll animation="fadeInUp">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("intro.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
              {t("intro.heading")}
            </h2>
            <div className="space-y-5 text-[#27415c] text-base md:text-lg leading-relaxed">
              <p>{t("intro.p1")}</p>
              <p>{t("intro.p2")}</p>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="py-14 md:py-20 bg-[#f4f7f9] px-4 sm:px-6">
        <Container className="max-w-5xl">
          <AnimateOnScroll animation="fadeInUp" className="mb-10">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("models.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
              {t("models.heading")}
            </h2>
            <p className="text-[#27415c] text-base leading-relaxed max-w-3xl">
              {t("models.intro")}
            </p>
          </AnimateOnScroll>
          <div className="grid md:grid-cols-2 gap-6">
            {MODEL_CARDS.map((card) => (
              <AnimateOnScroll key={card.href} animation="fadeInUp">
                <article className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col shadow-sm">
                  <h3 className="text-[#052638] font-semibold text-xl mb-3">
                    {t(card.titleKey)}
                  </h3>
                  <p className="text-[#27415c] text-base leading-relaxed mb-5 flex-1">
                    {t(card.bodyKey)}
                  </p>
                  <Link
                    href={card.href}
                    className="text-[#5a8f00] font-medium hover:underline inline-flex items-center gap-1"
                  >
                    {t(card.ctaKey)}
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
          <AnimateOnScroll animation="fadeInUp" className="mt-8 text-center">
            <Link
              href="/solar-panel-cleaning-system"
              className="text-[#052638] font-medium hover:text-[#5a8f00] transition-colors"
            >
              {t("models.ctaHub")} →
            </Link>
          </AnimateOnScroll>
        </Container>
      </section>

      <section className="py-14 md:py-16 bg-white px-4 sm:px-6">
        <Container className="max-w-3xl text-center">
          <AnimateOnScroll animation="fadeInUp">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {t("pricing.eyebrow")}
            </p>
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4">
              {t("pricing.heading")}
            </h2>
            <p className="text-[#27415c] text-base leading-relaxed mb-8">
              {t("pricing.body")}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
              <Link
                href="/solar-panel-cleaning-robot-price-india"
                className="inline-flex justify-center px-5 py-3 rounded-lg bg-[#052638] text-white font-medium hover:bg-[#0a3a4a] transition-colors"
              >
                {t("pricing.ctaPrice")}
              </Link>
              <Link
                href="/solar-panel-cleaning-robot-price-calculator#calculator"
                className="inline-flex justify-center px-5 py-3 rounded-lg border border-[#052638] text-[#052638] font-medium hover:bg-[#052638]/5 transition-colors"
              >
                {t("pricing.ctaCalculator")}
              </Link>
              <Link
                href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                className="inline-flex justify-center px-5 py-3 rounded-lg border border-[#A8C117] text-[#5a8f00] font-medium hover:bg-[#A8C117]/10 transition-colors"
              >
                {t("pricing.ctaService")}
              </Link>
            </div>
          </AnimateOnScroll>
        </Container>
      </section>

      <FaqSection
        id="cleaning-machine-faq"
        title={t("faq.heading")}
        subtitle={t("faq.intro")}
        faqs={faqs}
      />

      <section className="py-12 bg-[#0a3a4a] px-4 sm:px-6">
        <Container className="max-w-3xl">
          <h2 className="text-white font-semibold text-xl mb-4">{t("explore.heading")}</h2>
          <ul className="space-y-2">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="brand-inline-link text-sm md:text-base"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

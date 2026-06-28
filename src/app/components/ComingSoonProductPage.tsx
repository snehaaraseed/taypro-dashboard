import { getTranslations } from "next-intl/server";
import {
  Check,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import ProductHero from "@/app/components/ProductHero";
import { ProductVisualSection } from "@/app/components/ProductVisualSection";
import {
  buildProductHeroHighlights,
  productHeroBackgroundCredit,
} from "@/lib/products/product-hero-helpers";
import { resolveProductPageHeroBackground } from "@/lib/cms/product-page-hero-background";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { ProductSchema } from "@/app/components/StructuredData";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import RelatedProductLineupSection from "@/app/components/RelatedProductLineupSection";
import {
  buildCustomProductLineupRow,
  buildRelatedProductLineupRobots,
} from "@/lib/products/build-product-lineup";
import type { ComingSoonProductConfig } from "@/lib/product-coming-soon";
import type { ProductSchemaPriceKey } from "@/lib/seo/product-schema-prices";
import { SITE_URL } from "@/lib/seo/sitemap-config";

const siteUrl = SITE_URL;

const HIGHLIGHT_ICONS: LucideIcon[] = [
  Sparkles,
  Check,
  Check,
  Check,
];

const USE_CASE_ICONS: LucideIcon[] = [Check, Check, Check];

type ComingSoonProductPageProps = {
  product: ComingSoonProductConfig;
  locale: string;
};

export async function ComingSoonProductPage({
  product,
  locale,
}: ComingSoonProductPageProps) {
  const ns = product.namespace;
  const t = await getTranslations({ locale, namespace: ns });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.robots"), href: "/solar-panel-cleaning-system" },
    { name: t("breadcrumbs.current"), href: "" },
  ];

  const highlights = ["0", "1", "2", "3"].map((key, idx) => ({
    icon: HIGHLIGHT_ICONS[idx] ?? Check,
    title: t(`highlights.${key}.title`),
    body: t(`highlights.${key}.body`),
  }));

  const useCases = ["0", "1", "2"].map((key, idx) => ({
    icon: USE_CASE_ICONS[idx] ?? Check,
    title: t(`useCases.${key}.title`),
    body: t(`useCases.${key}.body`),
  }));

  const relatedLinks = product.relatedHrefs.map((href, idx) => ({
    href,
    label: t(`related.links.${idx}.label`),
    description: t(`related.links.${idx}.description`),
  }));

  const pageUrl = `${siteUrl}${product.path}`;
  const heroBackground = await resolveProductPageHeroBackground(null, locale, {
    variant: product.id,
  });
  const heroHighlights = buildProductHeroHighlights(t);

  const relatedLineupRobots = [
    ...relatedLinks.map((link) =>
      buildCustomProductLineupRow({
        model: link.label,
        description: link.description,
        href: link.href,
      })
    ),
    ...(product.showRobotProductCards !== false
      ? buildRelatedProductLineupRobots("helyx")
      : []),
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name={t("schema.productName")}
        description={t("schema.productDescription")}
        image={`${siteUrl}${product.heroImagePath}`}
        sku={product.model}
        offerPriceKey={product.id as ProductSchemaPriceKey}
        offers={{
          availability: "https://schema.org/PreOrder",
        }}
      />

      <div className="min-h-screen overflow-x-hidden">
        <ProductHero
          badge={t("hero.comingSoonBadge")}
          eyebrow={t("intro.eyebrow")}
          title={t("hero.title")}
          subtitle={t("hero.subtitleShort")}
          backgroundImage={heroBackground.src}
          backgroundAlt={heroBackground.alt}
          backgroundCredit={productHeroBackgroundCredit(heroBackground)}
          ctaText={t("hero.ctaText")}
          ctaHref="#register-interest"
          ctaTopic={product.model}
          highlights={heroHighlights}
        />

        <section className="bg-white pt-4 sm:pt-8 pb-8">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("intro.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-6 leading-tight">
                {t("intro.title")}
              </h2>
              <div className="space-y-5 text-gray-600 text-base sm:text-lg leading-relaxed">
                <p>{t("intro.p1")}</p>
                <p>{t("intro.p2")}</p>
              </div>
            </AnimateOnScroll>
          </Container>
        </section>

        <ProductVisualSection
          imageSrc={product.heroImagePath}
          imageAlt={t("hero.imgAlt")}
          eyebrow={t("productVisual.eyebrow")}
          title={t("productVisual.title")}
          caption={t("hero.imgAlt")}
        />

        {product.id === "orion" && (
          <>
            <section className="bg-[#052638] py-14 sm:py-20">
              <Container>
                <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mx-auto mb-10">
                  <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                    {t("healthKit.eyebrow")}
                  </p>
                  <h2 className="text-white font-semibold text-3xl sm:text-4xl mb-4">
                    {t("healthKit.title")}
                  </h2>
                  <p className="text-gray-300 text-base leading-relaxed">
                    {t("healthKit.body")}
                  </p>
                </AnimateOnScroll>
                <ul className="max-w-2xl mx-auto space-y-3 text-gray-300">
                  {(["0", "1", "2"] as const).map((key) => (
                    <li key={key} className="flex gap-3 text-sm sm:text-base">
                      <Check
                        className="h-5 w-5 text-[#A8C117] shrink-0 mt-0.5"
                        aria-hidden
                      />
                      {t(`healthKit.item${key}`)}
                    </li>
                  ))}
                </ul>
              </Container>
            </section>
            <section className="bg-white py-14 sm:py-16 border-y border-gray-100">
              <Container className="max-w-3xl">
                <AnimateOnScroll animation="fadeInUp">
                  <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-3">
                    {t("renewalAttach.eyebrow")}
                  </p>
                  <h2 className="text-[#052638] font-semibold text-2xl sm:text-3xl mb-4">
                    {t("renewalAttach.title")}
                  </h2>
                  <p className="text-[#27415c] text-base sm:text-lg leading-relaxed">
                    {t("renewalAttach.body")}
                  </p>
                </AnimateOnScroll>
              </Container>
            </section>
          </>
        )}

        <section className="bg-[#f4f7f9] py-14 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("highlightsSection.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl leading-tight">
                {t("highlightsSection.title")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <AnimateOnScroll
                    key={item.title}
                    animation="fadeInUp"
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                  >
                    <Icon
                      className="h-8 w-8 text-[#A8C117] mb-4"
                      aria-hidden
                    />
                    <h3 className="text-[#052638] font-semibold text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {item.body}
                    </p>
                  </AnimateOnScroll>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("useCasesSection.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl mb-6 leading-tight">
                {t("useCasesSection.title")}
              </h2>
              <ul className="space-y-6">
                {useCases.map((item) => (
                  <li
                    key={item.title}
                    className="flex gap-4 rounded-xl border border-gray-100 bg-[#f8fafb] p-5"
                  >
                    <item.icon
                      className="h-6 w-6 text-[#A8C117] shrink-0 mt-0.5"
                      aria-hidden
                    />
                    <div>
                      <h3 className="text-[#052638] font-semibold text-lg mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </AnimateOnScroll>
          </Container>
        </section>

        <section
          id="register-interest"
          className="bg-[#052638] py-14 sm:py-20 scroll-mt-24"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <h2 className="text-white font-semibold text-3xl sm:text-4xl mb-4">
                {t("notify.title")}
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
                {t("notify.subtitle")}
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <RequestEstimateForm
                variant="embedded"
                eyebrow={t("notify.formEyebrow")}
                title={t("notify.formTitle")}
                submitLabel={t("notify.submitLabel")}
                showCompanyField={false}
                showMessageField
                messageLabel={t("notify.messageLabel")}
                messagePlaceholder={t("notify.messagePlaceholder")}
                firstNameLabel={t("notify.firstNameLabel")}
                emailLabel={t("notify.emailLabel")}
                phoneLabel={t("notify.phoneLabel")}
                thankYouTitle={t("notify.thankYouTitle")}
                thankYouMessage={t("notify.thankYouMessage")}
                analyticsFormType="register_interest"
                leadIntent={t("notify.formTitle")}
                className="max-w-xl mx-auto"
              />
            </AnimateOnScroll>
          </Container>
        </section>

        <RelatedProductLineupSection
          headingId={`${product.id}-related-heading`}
          eyebrow={t("related.eyebrow")}
          title={t("related.title")}
          robots={relatedLineupRobots}
        />

        <section className="bg-[#f4f1e9] py-10 text-center">
          <Container size="narrow">
            <p className="text-gray-600 text-sm">
              {t("footerNote")}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              <a
                href={pageUrl}
                className="underline hover:text-[#052638]"
              >
                {pageUrl.replace(/^https?:\/\//, "")}
              </a>
            </p>
          </Container>
        </section>
      </div>
    </>
  );
}

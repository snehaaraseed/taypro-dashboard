import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Bell,
  Check,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import HeroSection from "@/app/components/Herosection";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Container } from "@/app/components/Container";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { ProductSchema } from "@/app/components/StructuredData";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ModelCards from "@/app/components/ModelCards";
import { Link } from "@/i18n/navigation";
import type { ComingSoonProductConfig } from "@/lib/product-coming-soon";
import { modelBCards } from "@/app/data";
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

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ProductSchema
        name={t("schema.productName")}
        description={t("schema.productDescription")}
        image={`${siteUrl}${product.heroImagePath}`}
        sku={product.model}
        offers={{
          price: t("schema.offersPrice"),
          priceCurrency: "INR",
          availability: "https://schema.org/PreOrder",
        }}
      />

      <div className="min-h-screen overflow-x-hidden">
        <div className="relative">
          <span className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 inline-flex items-center gap-2 rounded-full bg-[#A8C117] px-4 py-2 text-sm font-semibold text-[#052638] shadow-md">
            <Bell className="h-4 w-4" aria-hidden />
            {t("hero.comingSoonBadge")}
          </span>
          <HeroSection
            title={t("hero.title")}
            subtitle={t("hero.subtitle")}
            imgSrc={product.heroImagePath}
            imgAlt={t("hero.imgAlt")}
            ctaText={t("hero.ctaText")}
            ctaTopic={product.model}
          />
        </div>

        <section className="bg-white pt-12 sm:pt-20 pb-8">
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

        <section className="bg-[#052638] py-14 sm:py-20">
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
                messageLabel={t("notify.messageLabel")}
                messagePlaceholder={t("notify.messagePlaceholder")}
                submitLabel={t("notify.submitLabel")}
                className="max-w-xl mx-auto"
              />
            </AnimateOnScroll>
          </Container>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
                {t("related.eyebrow")}
              </div>
              <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl">
                {t("related.title")}
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col rounded-xl border border-gray-200 p-5 hover:border-[#A8C117] hover:shadow-md transition-all"
                >
                  <span className="text-[#052638] font-semibold text-lg group-hover:text-[#A8C117] transition-colors">
                    {link.label}
                  </span>
                  <span className="text-gray-600 text-sm mt-2 flex-1">
                    {link.description}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#A8C117] text-sm font-medium mt-4">
                    {t("related.linkCta")}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
            {product.showRobotModelCards !== false && (
              <ModelCards cards={modelBCards} />
            )}
          </Container>
        </section>

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

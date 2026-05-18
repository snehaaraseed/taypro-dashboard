import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { additionalProjects, energyResourceCards } from "@/app/data";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import type { Metadata } from "next";

const SITE_MAP_PATH = "/site-map";
const siteUrl = SITE_URL;
const ogImage = `${siteUrl}/tayproasset/taypro-robotImage.png`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "SiteMapPage.meta",
  });

  const keywords = [
    t("keyword0"),
    t("keyword1"),
    t("keyword2"),
    t("keyword3"),
    t("keyword4"),
    t("keyword5"),
  ];

  return withHreflang(SITE_MAP_PATH, locale, {
    title: t("title"),
    description: t("description"),
    keywords,
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${SITE_MAP_PATH}`,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: t("openGraphImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: [ogImage],
    },
  });
}

export default async function SiteMapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SiteMapPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const l = (key: string) => t(`links.${key}`);

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.sitemap"), href: "" },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />
      <section className="w-full pt-20 pb-5 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <h1 className="text-[#052638] text-6xl font-semibold text-center mb-16">
            {t("heading")}
          </h1>

          <div className="text-start">
            <h3 className="text-[#052638] text-4xl font-semibold mb-8">
              {t("sections.posts")}
            </h3>

            <ul className="space-y-1 list-disc list-inside">
              {energyResourceCards.map((card, idx) => (
                <li key={idx} className="text-lg">
                  <Link
                    href={card.href}
                    title={t("posts.energyResourcesTitle")}
                    className="text-[#7CB342] hover:text-[#689F38] transition-colors duration-200 font-medium"
                  >
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="w-full pt-10 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-start">
            <h3 className="text-[#052638] text-4xl font-semibold mb-8">
              {t("sections.pages")}
            </h3>

            <ul className="space-y-1 list-disc list-inside text-lg">
              <li>
                <Link
                  href="/company"
                  title={l("aboutUsTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("aboutUsLabel")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  title={l("blogTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("blogLabel")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  title={l("contactTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("contactLabel")}
                </Link>
                <ul className="mt-2 ml-6 space-y-2 list-circle list-inside text-base" />
              </li>
              <li>
                <Link
                  href="/"
                  title={l("homeTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("homeLabel")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  title={l("privacyPolicyTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("privacyPolicyLabel")}
                </Link>
              </li>
              <li>
                <Link
                  href="/performance-and-test-methodology"
                  title={l("performanceMethodologyTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("performanceMethodologyLabel")}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  title={l("projectsTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("projectsLabel")}
                </Link>
              </li>
              <li>
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator#calculator"
                  title={l("roiCalculatorTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("roiCalculatorLabel")}
                </Link>
              </li>
              <li>
                <Link
                  href="/site-map"
                  title={l("sitemapTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("sitemapLabel")}
                </Link>
              </li>
              <li>
                <Link
                  href="/solar-panel-cleaning-system"
                  title={l("solarRobotsTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("solarRobotsLabel")}
                </Link>
                <ul className="mt-2 ml-6 space-y-2 list-circle list-inside text-base">
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system"
                      title={l("automaticRobotTitle")}
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      {l("automaticRobotLabel")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system"
                      title={l("modelBTitle")}
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      {l("modelBLabel")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers"
                      title={l("modelTTitle")}
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      {l("modelTLabel")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
                      title={l("cleaningServiceTitle")}
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      {l("cleaningServiceLabel")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app"
                      title={l("tayproConsoleTitle")}
                      className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                    >
                      {l("tayproConsoleLabel")}
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link
                  href="/cleaning-technology"
                  title={l("cleaningTechnologyTitle")}
                  className="text-[#7CB342] hover:text-[#689F38] transition-colors"
                >
                  {l("cleaningTechnologyLabel")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="w-full pt-10 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-start">
            <h3 className="text-[#052638] text-4xl font-semibold mb-8">
              {t("sections.portfolio")}
            </h3>

            <ul className="space-y-1 list-disc list-inside">
              {additionalProjects.map((card, idx) => (
                <li key={idx} className="text-lg">
                  <Link
                    href={card.href}
                    title={t("portfolio.solarProjectTitle")}
                    className="text-[#7CB342] hover:text-[#689F38] transition-colors duration-200 font-medium"
                  >
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

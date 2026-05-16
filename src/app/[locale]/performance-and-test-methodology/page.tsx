import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { PERFORMANCE_METHODOLOGY_PATH } from "@/lib/seo/performance-methodology";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import type { Metadata } from "next";

const siteUrl = SITE_URL;
const lastUpdated = "May 15, 2026";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "PerformanceMethodologyPage.meta",
  });

  return withHreflang(PERFORMANCE_METHODOLOGY_PATH, locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} | Taypro`,
      description: t("description"),
      url: `${siteUrl}${PERFORMANCE_METHODOLOGY_PATH}`,
      type: "article",
    },
  });
}

export default async function PerformanceAndTestMethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PerformanceMethodologyPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumb"), href: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section className="w-full bg-white py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="text-[#052638] font-semibold text-4xl md:text-5xl mb-4 text-center">
              {t("breadcrumb")}
            </h1>
            <p className="text-[#5a7a8f] text-center text-sm mb-12">
              {t("lastUpdated", { date: lastUpdated })}
            </p>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                {t("purpose.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("purpose.body")}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                {t("dustRemoval.heading")}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-[#27415c] text-lg leading-relaxed pl-1">
                <li>{t("dustRemoval.li0")}</li>
                <li>{t("dustRemoval.li1")}</li>
                <li>{t("dustRemoval.li2")}</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                {t("generation.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("generation.p0")}
              </p>
              <p className="text-[#27415c] text-lg leading-relaxed mt-4">
                {t("generation.p1Before")}{" "}
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("generation.roiLink")}
                </Link>{" "}
                {t("generation.p1After")}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                {t("testing.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed mb-4">
                {t("testing.intro")}
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[#27415c] text-lg leading-relaxed pl-1">
                <li>{t("testing.li0")}</li>
                <li>{t("testing.li1")}</li>
                <li>{t("testing.li2")}</li>
                <li>{t("testing.li3")}</li>
              </ol>
              <p className="text-[#5a7a8f] text-base leading-relaxed mt-4">
                {t("testing.note")}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                {t("platform.heading")}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-[#052638] text-white">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        {t("platform.colPlatform")}
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        {t("platform.colMetric")}
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        {t("platform.colMethod")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-[#27415c]">
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#052638]">
                        {t("platform.modelA")}
                      </td>
                      <td className="px-4 py-3">{t("platform.modelAMetric")}</td>
                      <td className="px-4 py-3">{t("platform.modelAMethod")}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#052638]">
                        {t("platform.modelB")}
                      </td>
                      <td className="px-4 py-3">{t("platform.modelBMetric")}</td>
                      <td className="px-4 py-3">{t("platform.modelBMethod")}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#052638]">
                        {t("platform.modelT")}
                      </td>
                      <td className="px-4 py-3">{t("platform.modelTMetric")}</td>
                      <td className="px-4 py-3">{t("platform.modelTMethod")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                {t("uptime.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("uptime.body")}
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-[#052638] font-semibold text-2xl mb-4">
                {t("documentation.heading")}
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                {t("documentation.bodyBefore")}{" "}
                <Link
                  href="/contact"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("documentation.contactLink")}
                </Link>{" "}
                {t("documentation.bodyAfter")}
              </p>
            </section>

            <section className="rounded-xl border border-gray-200 bg-[#f8fafb] px-5 py-4 text-base text-[#27415c]">
              <p>
                {t("related.label")}{" "}
                <Link
                  href="/cleaning-technology"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("related.cleaningTech")}
                </Link>
                ,{" "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("related.systems")}
                </Link>
                ,{" "}
                <Link
                  href="/terms-of-service"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  {t("related.terms")}
                </Link>
                .
              </p>
            </section>
          </div>
        </section>
      </div>
    </>
  );
}

import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ContactEmailLink } from "@/app/components/ContactEmailLink";
import { ContactPhoneLink } from "@/app/components/ContactPhoneLink";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const LAST_UPDATED = "May 13, 2026";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TermsOfServicePage.meta" });

  return withHreflang("/terms-of-service", locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}/terms-of-service`,
      type: "website",
    },
  });
}

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TermsOfServicePage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumb"), href: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen bg-white">
        <section className="w-full bg-white py-15">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-[#0c2f42] text-center font-semibold text-7xl mb-20">
              {t("title")}
            </h1>

            <div className="mt-8">
              <h2 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                {t("overview.heading")}
              </h2>
              <div className="text-[#0c2f42] text-lg mb-8 font-normal">
                {t("overview.lastUpdated", { date: LAST_UPDATED })}
              </div>
              <div className="text-[#0c2f42] text-lg font-normal leading-9">
                {t("overview.intro")}
              </div>
              <hr className="border border-gray-300 mt-8" />
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s1.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s1.body")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s2.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s2.intro")}</div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>{t("s2.li0")}</li>
              <li>{t("s2.li1")}</li>
              <li>{t("s2.li2")}</li>
              <li>{t("s2.li3")}</li>
              <li>{t("s2.li4")}</li>
            </ul>
            <div className="text-[#0c2f42] text-lg mt-5">{t("s2.footer")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s3.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s3.p0")}</div>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s3.p1")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s4.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s4.body")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s5.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s5.body")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s6.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s6.body")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s7.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s7.body")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s8.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s8.body")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-10">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              {t("s9.heading")}
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              {t("s9.intro")}
              <br />
              <br />
              <span>
                {t("s9.mailLabel")}{" "}
                <ContactEmailLink className="hover:text-[#A8C117] transition-colors" location="legal_page">
                  {tCommon("emailLink")}
                </ContactEmailLink>
              </span>
              <span className="hidden sm:block mx-2"></span>
              <span>
                {t("s9.phoneLabel")} <ContactPhoneLink location="legal_page" />
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

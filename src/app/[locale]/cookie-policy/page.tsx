import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { ContactEmailLink } from "@/app/components/ContactEmailLink";
import { ContactPhoneLink } from "@/app/components/ContactPhoneLink";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const LAST_UPDATED = "May 13, 2026";

const BROWSER_LINKS = {
  chrome: "https://support.google.com/chrome/answer/95647",
  firefox:
    "https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences",
  safari:
    "https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac",
  edge: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
} as const;

const GOOGLE_PRIVACY_URL = "https://policies.google.com/privacy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CookiePolicyPage.meta" });

  return withHreflang("/cookie-policy", locale, {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}/cookie-policy`,
      type: "website",
    },
  });
}

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CookiePolicyPage" });
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
                {t("overview.introBefore")}{" "}
                <Link href="/privacy-policy" className="brand-inline-link">
                  {t("overview.privacyLink")}
                </Link>
                {t("overview.introAfter")}
              </div>
              <hr className="border border-gray-300 mt-8" />
            </div>
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s1.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s1.p0")}</div>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s1.p1")}</div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s2.heading")}</h3>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                {t("s2.necessary.heading")}
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                {t("s2.necessary.intro")}
              </div>
              <ul className="list-disc pl-10 space-y-2 text-lg text-[#0c2f42]">
                <li>
                  <strong>{t("s2.necessary.adminAuthLabel")}</strong>{" "}
                  {t("s2.necessary.adminAuthDesc")}
                </li>
                <li>
                  <strong>{t("s2.necessary.consentLabel")}</strong>{" "}
                  {t("s2.necessary.consentDesc")}
                </li>
              </ul>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                {t("s2.analytics.heading")}
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                {t("s2.analytics.intro")}
              </div>
              <div className="text-[#0c2f42] text-lg mb-4">
                <strong>{t("s2.analytics.currentlyLabel")}</strong>{" "}
                {t("s2.analytics.currentlyBody")}
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                {t("s2.marketing.heading")}
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                {t("s2.marketing.intro")}
              </div>
              <div className="text-[#0c2f42] text-lg mb-4">
                <strong>{t("s2.marketing.currentlyLabel")}</strong>{" "}
                {t("s2.marketing.currentlyBody")}
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-[#0c2f42] font-semibold text-2xl mb-4">
                {t("s2.thirdPartyTypes.heading")}
              </h4>
              <div className="text-[#0c2f42] text-lg mb-4">
                {t("s2.thirdPartyTypes.intro")}
              </div>
              <ul className="list-disc pl-10 space-y-2 text-lg text-[#0c2f42]">
                <li>
                  <strong>{t("s2.thirdPartyTypes.youtubeLabel")}</strong>{" "}
                  {t("s2.thirdPartyTypes.youtubeDesc")}
                </li>
                <li>
                  <strong>{t("s2.thirdPartyTypes.mapsLabel")}</strong>{" "}
                  {t("s2.thirdPartyTypes.mapsDesc")}
                </li>
                <li>
                  <strong>{t("s2.thirdPartyTypes.fontsLabel")}</strong>{" "}
                  {t("s2.thirdPartyTypes.fontsDesc")}
                </li>
                <li>
                  <strong>{t("s2.thirdPartyTypes.gtmLabel")}</strong>{" "}
                  {t("s2.thirdPartyTypes.gtmDesc")}
                </li>
              </ul>
              <div className="text-[#0c2f42] text-lg mt-4">
                <strong>{t("s2.thirdPartyTypes.noteLabel")}</strong>{" "}
                {t("s2.thirdPartyTypes.noteBody")}
              </div>
            </div>

            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s3.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s3.intro")}</div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>{t("s3.li0")}</li>
              <li>{t("s3.li1")}</li>
              <li>{t("s3.li2")}</li>
              <li>{t("s3.li3")}</li>
            </ul>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s4.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s4.intro")}</div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>{t("s4.li0")}</li>
              <li>{t("s4.li1")}</li>
              <li>{t("s4.li2")}</li>
            </ul>
            <div className="bg-gray-50 p-6 rounded-lg mt-6">
              <h4 className="text-[#0c2f42] font-semibold text-xl mb-3">
                {t("s4.browserSettings.heading")}
              </h4>
              <div className="text-[#0c2f42] text-lg">
                {t("s4.browserSettings.intro")}
              </div>
              <ul className="list-disc pl-10 space-y-2 text-lg text-[#0c2f42] mt-3">
                <li>
                  <a
                    href={BROWSER_LINKS.chrome}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-inline-link"
                  >
                    {t("s4.browserSettings.chrome")}
                  </a>
                </li>
                <li>
                  <a
                    href={BROWSER_LINKS.firefox}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-inline-link"
                  >
                    {t("s4.browserSettings.firefox")}
                  </a>
                </li>
                <li>
                  <a
                    href={BROWSER_LINKS.safari}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-inline-link"
                  >
                    {t("s4.browserSettings.safari")}
                  </a>
                </li>
                <li>
                  <a
                    href={BROWSER_LINKS.edge}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-inline-link"
                  >
                    {t("s4.browserSettings.edge")}
                  </a>
                </li>
              </ul>
            </div>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s5.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s5.intro")}</div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>
                <strong>{t("s5.sessionLabel")}</strong> {t("s5.sessionDesc")}
              </li>
              <li>
                <strong>{t("s5.persistentLabel")}</strong> {t("s5.persistentDesc")}
              </li>
            </ul>
            <div className="text-[#0c2f42] text-lg mt-5">
              {t("s5.durationsIntro")}
            </div>
            <ul className="list-disc pl-10 space-y-2 text-lg text-[#0c2f42] mt-3">
              <li>
                <strong>{t("s5.adminAuthLabel")}</strong> {t("s5.adminAuthDuration")}
              </li>
              <li>
                <strong>{t("s5.consentLabel")}</strong> {t("s5.consentDuration")}
              </li>
            </ul>
            <hr className="border border-gray-300 mt-8" />
          </div>
        </section>

        <section className="w-full bg-white py-5 pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-7">{t("s6.heading")}</h3>
            <div className="text-[#0c2f42] text-lg mb-5">{t("s6.p0")}</div>
            <div className="text-[#0c2f42] text-lg mb-5">
              {t("s6.servicesIntro")}
            </div>
            <ul className="list-disc pl-10 space-y-3 text-lg text-[#0c2f42]">
              <li>
                <strong>{t("s6.youtubeLabel")}</strong>{" "}
                <a
                  href={GOOGLE_PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-inline-link"
                >
                  {t("s6.googlePrivacyLink")}
                </a>
              </li>
              <li>
                <strong>{t("s6.mapsLabel")}</strong>{" "}
                <a
                  href={GOOGLE_PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-inline-link"
                >
                  {t("s6.googlePrivacyLink")}
                </a>
              </li>
              <li>
                <strong>{t("s6.fontsLabel")}</strong>{" "}
                <a
                  href={GOOGLE_PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-inline-link"
                >
                  {t("s6.googlePrivacyLink")}
                </a>
              </li>
            </ul>
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

        <section className="w-full bg-white py-5 pb-10">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-[#0c2f42] font-semibold text-5xl mb-10">
              {t("s8.heading")}
            </h3>
            <div className="text-[#0c2f42] text-lg mb-5">
              {t("s8.intro")}
              <br />
              <br />
              <span>
                {t("s8.mailLabel")}{" "}
                <ContactEmailLink className="hover:text-[#A8C117] transition-colors">
                  {tCommon("emailLink")}
                </ContactEmailLink>
              </span>
              <span className="hidden sm:block mx-2"></span>
              <span>
                {t("s8.phoneLabel")} <ContactPhoneLink />
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

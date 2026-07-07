import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import AccumulatingIntlProvider from "@/app/components/AccumulatingIntlProvider";
import { loadMessagesForClient } from "@/i18n/load-messages";
import { HtmlLocaleAttributes } from "@/app/components/HtmlLocaleAttributes";
import { SiteGraphSchema } from "@/app/components/StructuredData";
import { TAYPRO_SALES_PHONE_E164 } from "@/lib/contact";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import LeadModalRoot from "@/app/components/LeadModalRoot";
import DeferredLayoutWidgets from "@/app/components/DeferredLayoutWidgets";
import { routing } from "@/i18n/routing";
import { isActiveLocale } from "@/i18n/markets";
import { OG_PRESETS, buildOgImage, buildTwitterImageUrls } from "@/lib/seo/open-graph";
import {
  ROOT_DEFAULT_DESCRIPTION,
  ROOT_DEFAULT_OG_DESCRIPTION,
  ROOT_DEFAULT_TWITTER_DESCRIPTION,
} from "@/lib/seo/performance-methodology";
import { VisitorGeoProvider } from "@/lib/roi-calculator/visitor-geo-context";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const defaultOg = buildOgImage(OG_PRESETS.default);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Solar Panel Cleaning Robots for Utility-Scale Plants in India | Taypro",
    template: "%s | Taypro",
  },
  description: ROOT_DEFAULT_DESCRIPTION,
  authors: [{ name: "Taypro" }],
  creator: "Taypro",
  publisher: "Taypro",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Taypro",
    title: "Solar Panel Cleaning Robots | Waterless & Autonomous",
    description: ROOT_DEFAULT_OG_DESCRIPTION,
    images: [defaultOg],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Cleaning Robots | Waterless & Autonomous",
    description: ROOT_DEFAULT_TWITTER_DESCRIPTION,
    images: buildTwitterImageUrls([defaultOg]),
    creator: "@taypro",
    site: "@taypro",
  },
  verification: {
    google: "POwpbCt1VC81SCiYeic_JNaILeWuPXppkUxgAdfwAQo",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** ISR default for marketing pages; careers/blog/projects override when needed. */
export const revalidate = 3600;

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isActiveLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const clientCatalog = await loadMessagesForClient(locale);

  const localizedPath = (path: string) => {
    return locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;
  };

  const speculationRules = {
    prerender: [
      {
        source: "list",
        urls: [
          localizedPath("/"),
          localizedPath("/solar-panel-cleaning-system"),
          localizedPath("/company"),
          localizedPath("/contact"),
        ],
      },
    ],
  };

  return (
    <AccumulatingIntlProvider
      locale={locale}
      messages={clientCatalog}
      initialLogicalPath="/"
    >
      <script
        type="speculationrules"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speculationRules) }}
      />
      <link rel="alternate" type="application/rss+xml" href={`${siteUrl}/feed/blog.xml`} title="Taypro Blog Feed" />
      <link rel="alternate" type="application/rss+xml" href={`${siteUrl}/feed/press.xml`} title="Taypro Press Releases Feed" />
      <VisitorGeoProvider>
      <HtmlLocaleAttributes />
      <SiteGraphSchema
        siteUrl={siteUrl}
        contactPoint={{
          contactType: "customer service",
          telephone: TAYPRO_SALES_PHONE_E164,
        }}
        searchAction={{
          target: `${siteUrl}/blog?q={search_term_string}`,
          queryInput: "required name=search_term_string",
        }}
      />
      <LeadModalRoot>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <DeferredLayoutWidgets />
        </div>
      </LeadModalRoot>
      </VisitorGeoProvider>
    </AccumulatingIntlProvider>
  );
}

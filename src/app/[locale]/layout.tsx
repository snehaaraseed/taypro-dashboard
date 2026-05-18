import type { Metadata } from "next";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { buildClientMessages } from "@/i18n/pick-messages";
import { OrganizationSchema, WebSiteSchema } from "@/app/components/StructuredData";
import { TAYPRO_SALES_PHONE_E164 } from "@/lib/contact";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import LeadModalRoot from "@/app/components/LeadModalRoot";
import DeferredLayoutWidgets from "@/app/components/DeferredLayoutWidgets";
import LocaleBanner from "@/app/components/LocaleBanner";
import { routing } from "@/i18n/routing";
import { isActiveLocale } from "@/i18n/markets";
import { OG_PRESETS, buildOgImage, buildTwitterImageUrls } from "@/lib/seo/open-graph";
import {
  ROOT_DEFAULT_DESCRIPTION,
  ROOT_DEFAULT_OG_DESCRIPTION,
  ROOT_DEFAULT_TWITTER_DESCRIPTION,
} from "@/lib/seo/performance-methodology";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const defaultOg = buildOgImage(OG_PRESETS.default);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Solar Panel Cleaning Robots | Taypro — Waterless India",
    template: "%s | Taypro",
  },
  description: ROOT_DEFAULT_DESCRIPTION,
  keywords: [
    "Solar Panel Cleaning Robot",
    "solar panel cleaning robot",
    "automatic solar panel cleaning robot",
    "robotic solar panel cleaner",
    "solar panel cleaning automation",
    "solar farm cleaning robot",
    "waterless solar panel cleaning",
    "autonomous solar cleaning robot",
    "solar panel maintenance robot",
    "Taypro solar cleaning robot",
    "solar panel cleaning system",
    "solar cleaning robots India",
  ],
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
    title: "Solar Panel Cleaning Robots | Taypro — Waterless India",
    description: ROOT_DEFAULT_OG_DESCRIPTION,
    images: [defaultOg],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Cleaning Robot | Taypro",
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
  const messages = await getMessages();
  const headerList = await headers();
  const pathname =
    headerList.get("x-logical-pathname") ??
    headerList.get("x-pathname") ??
    "/";
  const clientMessages = buildClientMessages(messages, pathname);

  return (
    <NextIntlClientProvider messages={clientMessages}>
      <OrganizationSchema
        siteUrl={siteUrl}
        contactPoint={{
          contactType: "customer service",
          telephone: TAYPRO_SALES_PHONE_E164,
        }}
      />
      <WebSiteSchema siteUrl={siteUrl} />
      <LeadModalRoot>
        <div className="min-h-screen flex flex-col">
          <Header />
          {locale !== "en" ? <LocaleBanner /> : null}
          <main className="flex-grow">{children}</main>
          <Footer />
          <DeferredLayoutWidgets />
        </div>
      </LeadModalRoot>
    </NextIntlClientProvider>
  );
}

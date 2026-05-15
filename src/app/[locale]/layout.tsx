import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Blinker } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { OrganizationSchema, WebSiteSchema } from "@/app/components/StructuredData";
import Header from "@/app/components/Header";
import LeadModalRoot from "@/app/components/LeadModalRoot";
import DeferredLayoutWidgets from "@/app/components/DeferredLayoutWidgets";
import LocaleBanner from "@/app/components/LocaleBanner";
import { routing } from "@/i18n/routing";
import { LOCALE_LABELS, isActiveLocale, type TayproLocale } from "@/i18n/markets";
import { OG_PRESETS, buildOgImage, buildTwitterImageUrls } from "@/lib/seo/open-graph";
import {
  ROOT_DEFAULT_DESCRIPTION,
  ROOT_DEFAULT_OG_DESCRIPTION,
  ROOT_DEFAULT_TWITTER_DESCRIPTION,
} from "@/lib/seo/performance-methodology";
import "@/app/globals.css";

const Footer = dynamic(() => import("@/app/components/Footer"), { ssr: true });

const blinker = Blinker({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const defaultOg = buildOgImage(OG_PRESETS.default);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Solar Panel Cleaning Robot | Taypro - Autonomous Waterless Solar Cleaning",
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
    title:
      "Solar Panel Cleaning Robot | Taypro - Autonomous Waterless Solar Cleaning",
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
  alternates: {
    canonical: siteUrl,
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
  const dir = LOCALE_LABELS[locale as TayproLocale].dir;

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="icon" href="/tayproasset/taypro-favicon.png" sizes="any" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={blinker.className}>
        <NextIntlClientProvider messages={messages}>
          <OrganizationSchema siteUrl={siteUrl} />
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
      </body>
    </html>
  );
}

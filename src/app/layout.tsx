import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Blinker } from "next/font/google";
import { OrganizationSchema, WebSiteSchema } from "./components/StructuredData";

import "./globals.css";

// Lazy load Footer - it's not critical for initial render
const Footer = dynamic(() => import("./components/Footer"), {
  ssr: true, // Keep SSR for SEO but load asynchronously
});

// Header needs to be loaded immediately for navigation
import Header from "./components/Header";
// Cookie consent banner - client-side only (imported as client component)
import CookieConsentWrapper from "./components/CookieConsentWrapper";

const blinker = Blinker({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"], // Only load weights actually used
  display: "swap", // Optimize font loading
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Solar Panel Cleaning Robot | Taypro - Autonomous Waterless Solar Cleaning",
    template: "%s | Taypro",
  },
  description:
      "Best Solar Panel Cleaning Robots for solar farms in India. Autonomous waterless cleaning increases efficiency up to 30% with AI-powered scheduling. Highest uptime guarantee.",
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
    title: "Solar Panel Cleaning Robot | Taypro - Autonomous Waterless Solar Cleaning",
    description:
      "Best Solar Panel Cleaning Robots for solar farms in India. Autonomous waterless cleaning increases efficiency up to 30% with AI-powered scheduling.",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-robotImage.png`,
        width: 1200,
        height: 630,
        alt: "Taypro Solar Panel Cleaning Robot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solar Panel Cleaning Robot | Taypro",
    description:
      "Autonomous, waterless Solar Panel Cleaning Robots for solar farms. Increase efficiency up to 30% with AI-powered robotic cleaning systems.",
    images: [`${siteUrl}/tayproasset/taypro-robotImage.png`],
    creator: "@taypro",
    site: "@taypro",
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: "POwpbCt1VC81SCiYeic_JNaILeWuPXppkUxgAdfwAQo",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/tayproasset/taypro-favicon.png" sizes="any" />
        <link rel="canonical" href={siteUrl} />
        
        {/* DNS Prefetch for external resources - improves first-time connection speed */}
        <link rel="dns-prefetch" href="https://www.youtube.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* Preconnect to establish early connections - critical for first-time visitors */}
        <link rel="preconnect" href="https://www.youtube.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical resources - improves LCP for first-time visitors */}
        <link
          rel="preload"
          href="/tayproasset/taypro-logo.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/tayproasset/taypro-robotImage.png"
          as="image"
          type="image/png"
        />
        
        {/* Prefetch likely next resources - improves navigation speed */}
        <link rel="prefetch" href="/blog" as="document" />
        <link rel="prefetch" href="/projects" as="document" />
      </head>
      <body className={blinker.className}>
        <OrganizationSchema siteUrl={siteUrl} />
        <WebSiteSchema
          siteUrl={siteUrl}
          searchAction={{
            target: `${siteUrl}/blog?q={search_term_string}`,
            queryInput: "required name=search_term_string",
          }}
        />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <CookieConsentWrapper />
        </div>
      </body>
    </html>
  );
}

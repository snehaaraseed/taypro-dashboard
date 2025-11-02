import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Blinker } from "next/font/google";
import { OrganizationSchema, WebSiteSchema } from "./components/StructuredData";

import "./globals.css";

const blinker = Blinker({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600", "700", "800", "900"],
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
      "Taypro manufactures the best Solar Panel Cleaning Robots for solar farms in India. Autonomous, waterless cleaning with AI-powered scheduling. Increase solar plant efficiency up to 30% with our robotic cleaning systems.",
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
      "Taypro manufactures the best Solar Panel Cleaning Robots for solar farms in India. Autonomous, waterless cleaning with AI-powered scheduling. Increase solar plant efficiency up to 30%.",
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
    // Add your verification codes here if you have them
    // google: "your-google-verification-code",
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
        </div>
      </body>
    </html>
  );
}

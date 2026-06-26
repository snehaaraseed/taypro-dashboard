import type { Metadata, Viewport } from "next";
import { Blinker, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import { LOCALE_LABELS, isActiveLocale, type TayproLocale } from "@/i18n/markets";
import "@/app/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-montserrat",
});

const blinker = Blinker({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-blinker",
});

/** Minimal root metadata; locale routes add richer metadata in [locale]/layout. */
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/tayproasset/taypro-favicon.png", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

function resolveHtmlLocale(
  localeHeader: string | null,
  dirHeader: string | null
): { locale: TayproLocale; dir: "ltr" | "rtl" } {
  const locale = localeHeader && isActiveLocale(localeHeader)
    ? localeHeader
    : "en";
  const fallbackDir = LOCALE_LABELS[locale]?.dir ?? "ltr";
  const dir = dirHeader === "rtl" || dirHeader === "ltr" ? dirHeader : fallbackDir;
  return { locale, dir };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const { locale, dir } = resolveHtmlLocale(
    headersList.get("x-taypro-locale"),
    headersList.get("x-taypro-dir")
  );

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${montserrat.className} ${montserrat.variable} ${blinker.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

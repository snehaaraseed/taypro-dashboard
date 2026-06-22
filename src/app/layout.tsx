import type { Metadata } from "next";
import { Blinker, Montserrat } from "next/font/google";
import { headers } from "next/headers";
import { localeFromPathname } from "@/i18n/locale-from-pathname";
import { LOCALE_LABELS, type TayproLocale } from "@/i18n/markets";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "/";
  const locale = localeFromPathname(pathname);
  const dir = LOCALE_LABELS[locale].dir;

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

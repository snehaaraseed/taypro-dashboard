import type { Metadata } from "next";
import { Blinker } from "next/font/google";
import { headers } from "next/headers";
import { localeFromPathname } from "@/i18n/locale-from-pathname";
import { LOCALE_LABELS, type TayproLocale } from "@/i18n/markets";
import "@/app/globals.css";

const blinker = Blinker({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Minimal root metadata; locale routes add richer metadata in [locale]/layout. */
export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/tayproasset/taypro-favicon.png", sizes: "any" }],
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
      <head>
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
      <body className={blinker.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

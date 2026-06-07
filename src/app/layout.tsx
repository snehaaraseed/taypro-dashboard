import type { Metadata } from "next";
import { Blinker } from "next/font/google";
import { headers } from "next/headers";
import { localeFromPathname } from "@/i18n/locale-from-pathname";
import { LOCALE_LABELS, type TayproLocale } from "@/i18n/markets";
import "@/app/globals.css";

const blinker = Blinker({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/** Minimal root metadata; locale routes add richer metadata in [locale]/layout. */
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
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
      <body className={blinker.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

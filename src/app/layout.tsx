import type { Metadata, Viewport } from "next";
import { Blinker, Montserrat } from "next/font/google";
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
  metadataBase: new URL("https://taypro.in"),
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
  themeColor: "#A8C117",
};

// Pre-hydration fallback: keep <html lang/dir> aligned if middleware headers are absent.
// Primary locale/dir come from x-taypro-locale / x-taypro-dir in RootLayout (SSR).
const SET_HTML_LOCALE_SCRIPT = `(function(){try{var s=location.pathname.split("/")[1];var loc={hi:1,ar:1,ja:1,bn:1,en:1};var l=loc[s]?s:"en";var d=l==="ar"?"rtl":"ltr";var e=document.documentElement;e.lang=l;e.dir=d;}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* SEO: Pre-establish connections to critical third-party origins (saves 200-400ms LCP on mobile) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
      </head>
      <body
        className={`${montserrat.className} ${montserrat.variable} ${blinker.variable}`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: SET_HTML_LOCALE_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}

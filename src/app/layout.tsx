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

// Pre-hydration: set <html lang/dir> from the URL locale prefix before paint so
// RTL (ar) renders correctly without a flash. The root layout is statically
// rendered (no headers()), so it cannot know the locale at render time; this
// blocking inline script and the post-hydration <HtmlLocaleAttributes/> keep the
// attributes correct. Allowed by the CSP (`script-src 'unsafe-inline'`).
const SET_HTML_LOCALE_SCRIPT = `(function(){try{var s=location.pathname.split("/")[1];var loc={hi:1,ar:1,ja:1,bn:1,en:1};var l=loc[s]?s:"en";var d=l==="ar"?"rtl":"ltr";var e=document.documentElement;e.lang=l;e.dir=d;}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
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

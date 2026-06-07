import type { Metadata } from "next";
import { defineLocalizedMetadata } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const generateMetadata = defineLocalizedMetadata("/contact", () => ({
  title: "Thank You – We Appreciate Your Interest",
  description:
    "Thank you for reaching out to Taypro. Our team will get back to you shortly with details on our solar panel cleaning solutions that deliver high efficiency, maximum ROI, and sustainable energy performance.",
  openGraph: {
    title: "Thank You – We Appreciate Your Interest",
    description:
      "Thank you for contacting Taypro. We’ll connect with you soon to discuss how our solar cleaning robots can enhance your solar plant performance and savings.",
    url: `${siteUrl}/contact/thank-you`,
    type: "website",
  },robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
}));

export default function ThankyouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

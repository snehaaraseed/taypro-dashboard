"use client";

import Script from "next/script";
import { BreadcrumbListSchema, FAQPageSchema } from "./StructuredData";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOProps {
  breadcrumbs: BreadcrumbItem[];
  faqs?: FAQItem[] | FAQItem[][]; // <-- single OR multiple arrays
}

/**
 * SEO Component for App Router
 * Note: For App Router, use Metadata API in page.tsx or layout.tsx files for meta tags.
 * This component only handles JSON-LD structured data.
 */
export default function SEO({ breadcrumbs, faqs }: SEOProps) {
  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbListSchema items={breadcrumbs} />
      )}
      {faqs && <FAQPageSchema faqs={faqs} />}
    </>
  );
}

/**
 * Legacy export - kept for backward compatibility
 * @deprecated Use Metadata API in page.tsx or layout.tsx instead
 */
export function LegacySEO({
  title,
  description,
  keywords,
  url,
  breadcrumbs,
  faqs,
}: {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  breadcrumbs: BreadcrumbItem[];
  faqs?: FAQItem[] | FAQItem[][];
}) {
  console.warn(
    "LegacySEO is deprecated. Use Metadata API in page.tsx or layout.tsx for meta tags, and SEO component for structured data."
  );

  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbListSchema items={breadcrumbs} />
      )}
      {faqs && <FAQPageSchema faqs={faqs} />}
    </>
  );
}

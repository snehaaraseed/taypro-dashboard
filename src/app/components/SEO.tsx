import Head from "next/head";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url: string;
  breadcrumbs: BreadcrumbItem[];
  faqs?: FAQItem[] | FAQItem[][]; // <-- single OR multiple arrays
}

export default function SEO({
  title,
  description,
  keywords,
  url,
  breadcrumbs,
  faqs,
}: SEOProps) {
  // ✅ Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.com"}${
        item.href
      }`,
    })),
  };

  // ✅ Flatten multiple FAQ arrays into one
  let allFaqs: FAQItem[] = [];
  if (Array.isArray(faqs)) {
    if (faqs.length > 0 && Array.isArray(faqs[0])) {
      // If it's an array of arrays
      allFaqs = (faqs as FAQItem[][]).flat();
    } else {
      // Single array
      allFaqs = faqs as FAQItem[];
    }
  }

  // ✅ FAQ Schema (only if FAQs exist)
  const faqSchema =
    allFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <Head>
      {/* Basic Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </Head>
  );
}

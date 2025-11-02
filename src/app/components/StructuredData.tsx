import Script from "next/script";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface OrganizationSchemaProps {
  siteUrl?: string;
  logo?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
  sameAs?: string[];
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string;
  brand?: string;
  sku?: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
  };
}

interface WebSiteSchemaProps {
  siteUrl: string;
  searchAction?: {
    target: string;
    queryInput: string;
  };
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  publisher?: {
    name: string;
    logo?: string;
  };
}

interface VideoObjectSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  embedUrl?: string;
}

export function OrganizationSchema({
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
  logo = "https://taypro.in/tayproasset/taypro-logo.png",
  contactPoint,
  sameAs = [
    "https://www.linkedin.com/company/taypro",
    "https://www.youtube.com/c/taypro",
    "https://www.facebook.com/taypro",
    "https://www.instagram.com/taypro",
  ],
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Taypro",
    url: siteUrl,
    logo: logo,
    description:
      "Taypro develops and manufactures autonomous solar panel cleaning robots that help solar farms maintain optimal efficiency. We offer waterless cleaning solutions, dual-pass cleaning technology, and AI-powered scheduling systems.",
    foundingDate: "2020",
    contactPoint: contactPoint || {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "info@taypro.in",
    },
    sameAs: sameAs,
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    knowsAbout: [
      "Solar Panel Cleaning Robot",
      "Automatic Solar Panel Cleaning",
      "Robotic Solar Panel Maintenance",
      "Solar Farm Efficiency",
      "Waterless Solar Cleaning",
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbListSchema({
  items,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: {
  items: BreadcrumbItem[];
  siteUrl?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href || ""}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQPageSchema({ faqs }: { faqs: FAQItem[] | FAQItem[][] }) {
  if (!faqs || faqs.length === 0) return null;

  // Flatten multiple FAQ arrays into one
  let allFaqs: FAQItem[] = [];
  if (Array.isArray(faqs)) {
    if (faqs.length > 0 && Array.isArray(faqs[0])) {
      allFaqs = (faqs as FAQItem[][]).flat();
    } else {
      allFaqs = faqs as FAQItem[];
    }
  }

  if (allFaqs.length === 0) return null;

  const schema = {
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
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductSchema({
  name,
  description,
  image,
  brand = "Taypro",
  sku,
  offers,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: ProductSchemaProps & { siteUrl?: string }) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name,
    description: description,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    category: "Solar Panel Cleaning Robot",
  };

  if (image) {
    schema.image = image.startsWith("http") ? image : `${siteUrl}${image}`;
  }

  if (sku) {
    schema.sku = sku;
  }

  if (offers) {
    schema.offers = {
      "@type": "Offer",
      price: offers.price || "0",
      priceCurrency: offers.priceCurrency || "INR",
      availability: offers.availability || "https://schema.org/InStock",
      url: `${siteUrl}/contact`,
    };
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema({
  siteUrl,
  searchAction,
}: WebSiteSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Taypro",
    url: siteUrl,
    description:
      "Taypro - Leading manufacturer of Solar Panel Cleaning Robots for solar farms in India",
    publisher: {
      "@type": "Organization",
      name: "Taypro",
    },
  };

  if (searchAction) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: searchAction.target,
      },
      "query-input": searchAction.queryInput,
    };
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: ArticleSchemaProps & { siteUrl?: string }) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: headline,
    description: description,
    publisher: {
      "@type": "Organization",
      name: publisher?.name || "Taypro",
      logo: {
        "@type": "ImageObject",
        url: publisher?.logo || `${siteUrl}/tayproasset/taypro-logo.png`,
      },
    },
  };

  if (image) {
    schema.image = image.startsWith("http") ? image : `${siteUrl}${image}`;
  }

  if (datePublished) {
    schema.datePublished = datePublished;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (author) {
    schema.author = {
      "@type": "Person",
      name: author.name,
      url: author.url || siteUrl,
    };
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function VideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
}: VideoObjectSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: name,
    description: description,
    thumbnailUrl: thumbnailUrl,
    uploadDate: uploadDate,
  };

  if (contentUrl) {
    schema.contentUrl = contentUrl;
  }

  if (embedUrl) {
    schema.embedUrl = embedUrl;
  }

  return (
    <Script
      id="video-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone?: string;
  url?: string;
  openingHours?: string;
  priceRange?: string;
  image?: string;
  siteUrl?: string;
}

export function LocalBusinessSchema({
  name,
  description,
  address,
  telephone,
  url,
  openingHours,
  priceRange,
  image,
  siteUrl = "https://taypro.in",
}: LocalBusinessSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#organization`,
    name: name,
    description: description,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry,
    },
  };

  if (telephone) {
    schema.telephone = telephone;
  }

  if (url) {
    schema.url = url;
  }

  if (openingHours) {
    const timeMatch = openingHours.match(/(\d{2}:\d{2})-(\d{2}:\d{2})/);
    schema.openingHoursSpecification = {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: timeMatch ? timeMatch[1] : "09:00",
      closes: timeMatch ? timeMatch[2] : "18:00",
    };
  }

  if (priceRange) {
    schema.priceRange = priceRange;
  }

  if (image) {
    schema.image = image;
    schema.logo = image;
  }

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}


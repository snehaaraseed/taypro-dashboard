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
  imageAlt?: string;
  /** Canonical article URL (absolute or site-root path). */
  url?: string;
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
  /** Unique id when multiple Article scripts could coexist in dev HMR. */
  scriptId?: string;
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
  // Per Google's BreadcrumbList guidance, `item` is optional on the last list element.
  // When a breadcrumb entry has an empty href (the current page), we omit the `item`
  // field rather than emitting an inaccurate URL (e.g. the site root).
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const base: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
      };
      if (item.href) {
        base.item = `${siteUrl}${item.href}`;
      }
      return base;
    }),
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

interface ServiceSchemaProps {
  name: string;
  description: string;
  image?: string;
  provider?: string;
  serviceType?: string;
  areaServed?: string;
  url?: string;
}

export function ServiceSchema({
  name,
  description,
  image,
  provider = "Taypro",
  serviceType = "Solar Panel Cleaning Service",
  areaServed = "India",
  url,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: ServiceSchemaProps & { siteUrl?: string }) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: name,
    description: description,
    serviceType: serviceType,
    provider: {
      "@type": "Organization",
      name: provider,
      url: siteUrl,
    },
    areaServed: {
      "@type": "Country",
      name: areaServed,
    },
  };

  if (image) {
    schema.image = image.startsWith("http") ? image : `${siteUrl}${image}`;
  }

  if (url) {
    schema.url = url.startsWith("http") ? url : `${siteUrl}${url}`;
  }

  return (
    <Script
      id="service-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareApplicationSchemaProps {
  name: string;
  description: string;
  image?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  url?: string;
}

export function SoftwareApplicationSchema({
  name,
  description,
  image,
  applicationCategory = "BusinessApplication",
  operatingSystem = "Web, iOS, Android",
  url,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: SoftwareApplicationSchemaProps & { siteUrl?: string }) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: name,
    description: description,
    applicationCategory: applicationCategory,
    operatingSystem: operatingSystem,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    publisher: {
      "@type": "Organization",
      name: "Taypro",
      url: siteUrl,
    },
  };

  if (image) {
    schema.image = image.startsWith("http") ? image : `${siteUrl}${image}`;
  }

  if (url) {
    schema.url = url.startsWith("http") ? url : `${siteUrl}${url}`;
  }

  return (
    <Script
      id="software-application-schema"
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
  imageAlt,
  url,
  datePublished,
  dateModified,
  author,
  publisher,
  scriptId = "article-schema",
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: ArticleSchemaProps & { siteUrl?: string }) {
  const schema: Record<string, unknown> = {
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
    const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;
    schema.image = {
      "@type": "ImageObject",
      url: imageUrl,
      caption: imageAlt?.trim() || headline,
    };
  }

  if (url) {
    const fullUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;
    schema.url = fullUrl;
    schema.mainEntityOfPage = {
      "@type": "WebPage",
      "@id": fullUrl,
    };
  }

  if (datePublished) {
    schema.datePublished = datePublished;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (author) {
    const authorNode: Record<string, unknown> = {
      "@type": "Person",
      name: author.name,
    };
    if (author.url) {
      authorNode.url = author.url.startsWith("http")
        ? author.url
        : `${siteUrl}${author.url.startsWith("/") ? "" : "/"}${author.url}`;
    }
    schema.author = authorNode;
  }

  return (
    <Script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PlaceSchema({
  name,
  description,
  addressLocality,
  addressRegion,
  addressCountry = "IN",
  latitude,
  longitude,
  schemaId = "place-schema",
}: {
  name: string;
  description?: string;
  addressLocality: string;
  addressRegion: string;
  addressCountry?: string;
  latitude?: number;
  longitude?: number;
  schemaId?: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Place",
    name,
    address: {
      "@type": "PostalAddress",
      addressLocality,
      addressRegion,
      addressCountry,
    },
  };

  if (description) {
    schema.description = description;
  }

  if (latitude != null && longitude != null) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }

  return (
    <Script
      id={schemaId}
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

export interface HowToStep {
  name: string;
  text: string;
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  image,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  image?: string;
  siteUrl?: string;
}) {
  if (!steps || steps.length === 0) return null;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((s, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: s.name,
      text: s.text,
    })),
  };

  if (totalTime) schema.totalTime = totalTime;
  if (image) schema.image = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return (
    <Script
      id="howto-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface ItemListEntry {
  name: string;
  url: string;
  description?: string;
  image?: string;
}

export function ItemListSchema({
  name,
  description,
  items,
  scriptId = "item-list-schema",
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: {
  name: string;
  description?: string;
  items: ItemListEntry[];
  scriptId?: string;
  siteUrl?: string;
}) {
  if (!items || items.length === 0) return null;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: items.length,
    itemListElement: items.map((entry, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: entry.url.startsWith("http") ? entry.url : `${siteUrl}${entry.url}`,
      name: entry.name,
      ...(entry.description ? { description: entry.description } : {}),
      ...(entry.image
        ? {
            image: entry.image.startsWith("http")
              ? entry.image
              : `${siteUrl}${entry.image}`,
          }
        : {}),
    })),
  };

  if (description) schema.description = description;

  return (
    <Script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CollectionPageSchema({
  name,
  description,
  url,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: {
  name: string;
  description: string;
  url: string;
  siteUrl?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: name,
    description: description,
    url: url,
    publisher: {
      "@type": "Organization",
      name: "Taypro",
      logo: `${siteUrl}/tayproasset/taypro-logo.png`,
    },
  };

  return (
    <Script
      id="collection-page-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ProfilePageSchemaProps {
  url: string;
  name: string;
  description: string;
  role?: string;
  image?: string;
  sameAs?: string[];
  postCount?: number;
  siteUrl?: string;
}

export function ProfilePageSchema({
  url,
  name,
  description,
  role,
  image,
  sameAs,
  postCount,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in",
}: ProfilePageSchemaProps) {
  const person: Record<string, unknown> = {
    "@type": "Person",
    name,
    description,
    url,
  };
  if (role) person.jobTitle = role;
  if (image)
    person.image = image.startsWith("http") ? image : `${siteUrl}${image}`;
  if (sameAs && sameAs.length > 0) person.sameAs = sameAs;
  person.worksFor = {
    "@type": "Organization",
    name: "Taypro",
    url: siteUrl,
  };

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    name: `${name} - Taypro Blog Author`,
    description,
    mainEntity: person,
  };

  if (typeof postCount === "number") {
    schema.interactionStatistic = {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WriteAction",
      userInteractionCount: postCount,
    };
  }

  return (
    <Script
      id="profile-page-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}


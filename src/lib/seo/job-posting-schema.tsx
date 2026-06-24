import type { JobOpening } from "@/lib/erpnext/types";
import { jobDisplayTitle } from "@/lib/erpnext/job-openings";

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "full-time": "FULL_TIME",
  "full time": "FULL_TIME",
  "part-time": "PART_TIME",
  "part time": "PART_TIME",
  contract: "CONTRACTOR",
  contractor: "CONTRACTOR",
  temporary: "TEMPORARY",
  intern: "INTERN",
  internship: "INTERN",
};

function schemaEmploymentType(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined;
  return EMPLOYMENT_TYPE_MAP[raw.trim().toLowerCase()];
}

function schemaDatePosted(postedOn?: string): string | undefined {
  if (!postedOn?.trim()) return undefined;
  const parsed = new Date(postedOn);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function schemaJobLocation(location?: string) {
  const locality = location?.trim() || "Pune";
  return {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
  };
}

export type JobPostingSchemaProps = {
  job: JobOpening;
  description: string;
  url: string;
  siteUrl: string;
};

export function JobPostingSchema({
  job,
  description,
  url,
  siteUrl,
}: JobPostingSchemaProps) {
  const title = jobDisplayTitle(job);
  const datePosted = schemaDatePosted(job.posted_on);
  const employmentType = schemaEmploymentType(job.employment_type);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    identifier: {
      "@type": "PropertyValue",
      name: "Taypro",
      value: job.name,
    },
    url,
    datePosted,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company?.trim() || "Taypro Private Limited",
      sameAs: siteUrl,
      logo: `${siteUrl}/apple-touch-icon.png`,
    },
    jobLocation: schemaJobLocation(job.location),
    directApply: true,
    applicationContact: {
      "@type": "ContactPoint",
      contactType: "HR",
      url,
    },
  };

  if (employmentType) {
    schema.employmentType = employmentType;
  }

  return (
    <script
      id={`job-posting-schema-${job.name.replace(/[^a-zA-Z0-9_-]/g, "-")}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

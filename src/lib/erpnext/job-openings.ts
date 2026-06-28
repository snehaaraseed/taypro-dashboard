import { erpnextFetch } from "./client";
import type { FrappeListResponse, JobOpening } from "./types";

export const JOB_OPENINGS_REVALIDATE_SECONDS = 300;

const JOB_OPENING_FIELDS = [
  "name",
  "job_title",
  "designation",
  "department",
  "location",
  "employment_type",
  "description",
  "route",
  "posted_on",
  "company",
  "status",
] as const;

/** Open roles only, publish_on_website omitted (not queryable on all ERPNext setups). */
const OPEN_FILTERS: [string, string, string | number][] = [
  ["status", "=", "Open"],
];

function buildListQuery(
  extraFilters: [string, string, string | number][] = [],
  options?: { openOnly?: boolean }
) {
  const openOnly = options?.openOnly !== false;
  const filters = JSON.stringify(
    openOnly ? [...OPEN_FILTERS, ...extraFilters] : extraFilters
  );
  const fields = JSON.stringify([...JOB_OPENING_FIELDS]);
  return `/api/resource/Job Opening?filters=${encodeURIComponent(filters)}&fields=${encodeURIComponent(fields)}&limit_page_length=100&order_by=posted_on desc`;
}

export function isJobOpeningOpen(job: JobOpening): boolean {
  return job.status?.trim().toLowerCase() === "open";
}

const fetchOptions = {
  next: { revalidate: JOB_OPENINGS_REVALIDATE_SECONDS, tags: ["erpnext-job-openings"] },
};

export async function listOpenJobOpenings(): Promise<JobOpening[]> {
  const result = await erpnextFetch<FrappeListResponse<JobOpening>>(
    buildListQuery(),
    fetchOptions
  );
  return result.data ?? [];
}

async function fetchJobOpeningByRouteKey(
  route: string,
  openOnly: boolean
): Promise<JobOpening | null> {
  const normalized = route.trim();
  if (!normalized) return null;

  const queryOptions = { openOnly };

  const byRoute = await erpnextFetch<FrappeListResponse<JobOpening>>(
    buildListQuery([["route", "=", normalized]], queryOptions),
    fetchOptions
  );
  if (byRoute.data?.[0]) return byRoute.data[0];

  const byName = await erpnextFetch<FrappeListResponse<JobOpening>>(
    buildListQuery([["name", "=", normalized]], queryOptions),
    fetchOptions
  );
  return byName.data?.[0] ?? null;
}

export async function getJobOpeningByRoute(route: string): Promise<JobOpening | null> {
  return fetchJobOpeningByRouteKey(route, true);
}

/** Includes filled/closed roles, used for redirects off stale job URLs. */
export async function getJobOpeningByRouteAnyStatus(
  route: string
): Promise<JobOpening | null> {
  return fetchJobOpeningByRouteKey(route, false);
}

export async function getJobOpeningByName(
  name: string,
  openOnly = true
): Promise<JobOpening | null> {
  const normalized = name.trim();
  if (!normalized) return null;

  const result = await erpnextFetch<FrappeListResponse<JobOpening>>(
    buildListQuery([["name", "=", normalized]], { openOnly }),
    fetchOptions
  );
  return result.data?.[0] ?? null;
}

export function jobOpeningSlug(job: JobOpening): string {
  return (job.route?.trim() || job.name).replace(/^\/+/, "");
}

/** Join catch-all route segments into ERPNext route key (e.g. jobs/company/role). */
export function joinCareerSlugSegments(segments: string | string[]): string {
  const parts = Array.isArray(segments) ? segments : [segments];
  return parts.map((s) => s.trim()).filter(Boolean).join("/");
}

/** Public path for a job detail page under /careers. */
export function careersJobPath(jobOrSlug: JobOpening | string): string {
  const slug =
    typeof jobOrSlug === "string" ? jobOrSlug : jobOpeningSlug(jobOrSlug);
  return `/careers/${slug.replace(/^\/+/, "")}`;
}

export function jobDisplayTitle(job: JobOpening): string {
  return job.job_title?.trim() || job.designation?.trim() || job.name;
}

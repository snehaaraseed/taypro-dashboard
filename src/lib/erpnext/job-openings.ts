import { erpnextFetch } from "./client";
import type { FrappeListResponse, JobOpening } from "./types";

/** Sitemap and other background jobs — careers pages fetch fresh on each request. */
export const JOB_OPENINGS_REVALIDATE_SECONDS = 3600;
export const JOB_OPENINGS_CACHE_TAG = "erpnext-job-openings";

type JobOpeningsFetchMode = "cached" | "fresh";

function jobOpeningsFetchOptions(mode: JobOpeningsFetchMode) {
  if (mode === "fresh") {
    return { cache: "no-store" as const };
  }
  return {
    next: {
      revalidate: JOB_OPENINGS_REVALIDATE_SECONDS,
      tags: [JOB_OPENINGS_CACHE_TAG],
    },
  };
}

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

export async function listOpenJobOpenings(
  options?: { fresh?: boolean }
): Promise<JobOpening[]> {
  const mode: JobOpeningsFetchMode = options?.fresh ? "fresh" : "cached";
  const result = await erpnextFetch<FrappeListResponse<JobOpening>>(
    buildListQuery(),
    jobOpeningsFetchOptions(mode)
  );
  return result.data ?? [];
}

async function fetchJobOpeningByRouteKey(
  route: string,
  openOnly: boolean,
  mode: JobOpeningsFetchMode = "cached"
): Promise<JobOpening | null> {
  const normalized = route.trim();
  if (!normalized) return null;

  const queryOptions = { openOnly };
  const fetchOptions = jobOpeningsFetchOptions(mode);

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

export async function getJobOpeningByRoute(
  route: string,
  options?: { fresh?: boolean }
): Promise<JobOpening | null> {
  const mode: JobOpeningsFetchMode = options?.fresh ? "fresh" : "cached";
  return fetchJobOpeningByRouteKey(route, true, mode);
}

/** Includes filled/closed roles, used for redirects off stale job URLs. */
export async function getJobOpeningByRouteAnyStatus(
  route: string,
  options?: { fresh?: boolean }
): Promise<JobOpening | null> {
  const mode: JobOpeningsFetchMode = options?.fresh ? "fresh" : "cached";
  return fetchJobOpeningByRouteKey(route, false, mode);
}

export async function getJobOpeningByName(
  name: string,
  openOnly = true,
  options?: { fresh?: boolean }
): Promise<JobOpening | null> {
  const normalized = name.trim();
  if (!normalized) return null;

  const mode: JobOpeningsFetchMode = options?.fresh ? "fresh" : "cached";
  const result = await erpnextFetch<FrappeListResponse<JobOpening>>(
    buildListQuery([["name", "=", normalized]], { openOnly }),
    jobOpeningsFetchOptions(mode)
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

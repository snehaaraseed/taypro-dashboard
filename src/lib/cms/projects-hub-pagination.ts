export const PROJECTS_HUB_PORTFOLIO_PAGE_SIZE = 24;

export function projectsHubPagePath(page: number): string {
  if (page <= 1) return "/projects";
  return `/projects?page=${page}`;
}

export function projectsHubPageUrl(siteUrl: string, page: number): string {
  const base = siteUrl.replace(/\/$/, "");
  if (page <= 1) return `${base}/projects`;
  return `${base}/projects?page=${page}`;
}

export function parseProjectsHubPage(
  raw: string | string[] | undefined
): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = parseInt(String(value || "1"), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

export function projectsHubPaginationLinks(
  siteUrl: string,
  page: number,
  totalPages: number
): { previous?: string; next?: string } {
  const links: { previous?: string; next?: string } = {};
  if (page > 1) links.previous = projectsHubPageUrl(siteUrl, page - 1);
  if (page < totalPages) links.next = projectsHubPageUrl(siteUrl, page + 1);
  return links;
}

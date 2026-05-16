/** Root-absolute URL for a file in /public (never locale-prefixed). */
export function publicAssetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalized}`;
  }
  return normalized;
}

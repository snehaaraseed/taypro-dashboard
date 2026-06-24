/** Build a Next.js image optimizer URL for local static paths. */
export function nextImageUrl(
  src: string,
  width = 1400,
  quality = 75
): string {
  if (!src.startsWith("/") || src.startsWith("//")) {
    return src;
  }
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality),
  });
  return `/_next/image?${params.toString()}`;
}

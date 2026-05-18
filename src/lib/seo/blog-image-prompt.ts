import "server-only";

/** Shared hero prompt for external image APIs (Pollinations, Imagen). */
export function buildBlogHeroImagePrompt(
  title: string,
  description: string,
  seoKeyword: string
): string {
  const context = description.replace(/\s+/g, " ").trim().slice(0, 280);
  return `Professional editorial photograph for a utility-scale solar energy industry blog.
Article title: ${title}
SEO topic: ${seoKeyword}
Context: ${context}

Photorealistic wide hero image, documentary industrial photography:
- Large ground-mount solar PV plant in India, clear daylight or golden hour
- Visually supports the article topic (soiling on modules, dust, O&M context, performance monitoring)
- No text overlays, logos, watermarks, or brand names
- No cartoon or illustration style
- No close-up identifiable faces; distant workers optional and small
- Do not show branded cleaning robots unless the title mentions robots
- 16:9 composition for a website blog header`;
}

export function buildGeneratedBlogImageAlt(
  title: string,
  seoKeyword: string
): string {
  const base = title.replace(/\s+/g, " ").trim();
  const kw = seoKeyword.trim();
  const alt = `${base} — utility-scale solar plant in India illustrating ${kw}`;
  return alt.length <= 200 ? alt : alt.slice(0, 197) + "...";
}

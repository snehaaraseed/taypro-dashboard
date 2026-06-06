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
  const alt = `${base}, utility-scale solar plant in India illustrating ${kw}`;
  return alt.length <= 200 ? alt : alt.slice(0, 197) + "...";
}

/** Mid-article illustration — detail/context shot, not a wide hero. */
export function buildBlogInlineImagePrompt(
  title: string,
  description: string,
  seoKeyword: string
): string {
  const context = description.replace(/\s+/g, " ").trim().slice(0, 280);
  return `Professional editorial photograph for the body of a utility-scale solar energy blog article.
Article title: ${title}
SEO topic: ${seoKeyword}
Context: ${context}

Photorealistic detail or mid-range scene (NOT a wide banner hero):
- Ground-mount solar PV in India: module rows, soiling/dust on glass, O&M context, plant infrastructure
- Visually supports the section topic (equipment, soiling, monitoring, economics — match the article angle)
- No text overlays, logos, watermarks, or brand names
- No cartoon or illustration style
- No close-up identifiable faces
- Do not show branded cleaning robots unless the title explicitly mentions robots
- 16:9 composition suitable for an inline figure between article sections`;
}

export function buildGeneratedBlogInlineImageAlt(
  title: string,
  seoKeyword: string
): string {
  const base = title.replace(/\s+/g, " ").trim();
  const kw = seoKeyword.trim();
  const alt = `${base}, inline view of utility-scale solar operations in India related to ${kw}`;
  return alt.length <= 200 ? alt : alt.slice(0, 197) + "...";
}

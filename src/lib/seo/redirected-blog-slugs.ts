/** Blog slugs that 301 to a canonical winner (SEO-020 + Ahrefs 404 remediation). */
export const REDIRECTED_BLOG_SLUGS = new Set([
  "what-is-the-solar-panel-efficiency-in-2025",
  "what-is-solar-panel-cleaning",
  "the-importance-of-regular-solar-panel-cleaning-for-efficiency",
  "5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-drops",
  "what-are-the-different-types-of-solar-panels-2",
  "what-are-the-best-practices-of-cleaning-solar-pane",
  "how-does-a-solar-panel-cleaning-robot-work-",
  "the-impact-of-weather-on-solar-panel-cleanliness-in-india",
  "the-importance-of-solar-panel-cleaning-across-different-regions-of-india",
  "5-signs-your-solar-panel-cleaning-needs-automated-cleaning-before-revenue-starts-dropping",
  "how-automated-systems-can-monitor-solar-panel-performance",
  "how-often-should-your-solar-panels-in-india",
  "managing-performance-ratio-losses-why-a-solar-panel-cleaning-robot-beats-manual-labor",
  "solar-panel-checklist-2025",
  "solar-panel-cleaning-checklist-2025",
  "solar-panel-cleaning-robot-price-calculator",
  "solar-plant-commissioning-robot-integration-checklist-for-utility-pv",
  "the-impact-of-weather-on-solar-panel-liness-in-india-tips-for-optimal-performance",
  "what-are-best-practices-of-cleaning-solar-panels",
  "what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels-why-is-it-necessary-to-clean-solar-panels",
  "why-utility-solar-farms-in-india-need-autonomous-panel-cleaning",
  "the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates-tailoring-solutions-for-diverse-climates",
  "single-axis-tracker-cleaning-robot",
  "performance-ratio-utility-solar-plant-india",
  "solar-plant-commissioning-robot-integration-checklist",
  "waterless-vs-manual-solar-cleaning-cost-10-mw-india",
  "how-to-choose-best-solar-panels",
]);

/** Destination paths (blog slug or site path). */
export const REDIRECTED_BLOG_TARGETS: Record<string, string> = {
  "what-is-the-solar-panel-efficiency-in-2025":
    "/blog/what-is-solar-panel-efficiency",
  "what-is-solar-panel-cleaning":
    "/blog/what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels",
  "the-importance-of-regular-solar-panel-cleaning-for-efficiency":
    "/blog/the-crucial-role-of-regular-solar-panel-cleaning-for-efficiency-keeping-performance-high-in-a-dusty-world",
  "5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-drops":
    "/blog/5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-starts-dropping",
  "what-are-the-different-types-of-solar-panels-2":
    "/blog/what-are-the-different-types-of-solar-panels",
  "what-are-the-best-practices-of-cleaning-solar-pane":
    "/blog/what-are-the-best-practices-of-cleaning-solar-panels",
  "how-does-a-solar-panel-cleaning-robot-work-":
    "/blog/how-does-a-solar-panel-cleaning-robot-work",
  "the-impact-of-weather-on-solar-panel-cleanliness-in-india":
    "/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india-tips-for-optimal-performance",
  "the-importance-of-solar-panel-cleaning-across-different-regions-of-india":
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates",
  "5-signs-your-solar-panel-cleaning-needs-automated-cleaning-before-revenue-starts-dropping":
    "/blog/5-signs-your-solar-plant-needs-automated-cleaning-before-revenue-starts-dropping",
  "how-automated-systems-can-monitor-solar-panel-performance":
    "/blog/beyond-cleaning-how-automated-systems-can-monitor-solar-panel-performance",
  "how-often-should-your-solar-panels-in-india":
    "/blog/how-often-should-you-clean-your-solar-panels-in-india",
  "managing-performance-ratio-losses-why-a-solar-panel-cleaning-robot-beats-manual-labor":
    "/blog/improving-performance-ratio-in-utility-scale-solar-plants-india-inverter-efficiency-optimization",
  "solar-panel-checklist-2025": "/blog/solar-panel-maintenance-checklist-2025",
  "solar-panel-cleaning-checklist-2025":
    "/blog/solar-panel-maintenance-checklist-2025",
  "solar-panel-cleaning-robot-price-calculator":
    "/solar-panel-cleaning-robot-price-calculator",
  "solar-plant-commissioning-robot-integration-checklist-for-utility-pv":
    "/blog/optimizing-best-pv-panels-commissioning-robot-integration-checklists",
  "the-impact-of-weather-on-solar-panel-liness-in-india-tips-for-optimal-performance":
    "/blog/the-impact-of-weather-on-solar-panel-cleanliness-in-india-tips-for-optimal-performance",
  "what-are-best-practices-of-cleaning-solar-panels":
    "/blog/what-are-the-best-practices-of-cleaning-solar-panels",
  "what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels-why-is-it-necessary-to-clean-solar-panels":
    "/blog/what-is-solar-panel-cleaning-why-is-it-necessary-to-clean-solar-panels",
  "why-utility-solar-farms-in-india-need-autonomous-panel-cleaning":
    "/blog/why-modern-solar-farms-need-autonomous-solar-panel-cleaning-systems",
  "the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates-tailoring-solutions-for-diverse-climates":
    "/blog/the-importance-of-solar-panel-cleaning-across-different-regions-of-india-tailoring-solutions-for-diverse-climates",
  "single-axis-tracker-cleaning-robot":
    "/blog/solar-tracker-maintenance-complete-guide",
  "performance-ratio-utility-solar-plant-india":
    "/blog/improving-performance-ratio-in-utility-scale-solar-plants-india-inverter-efficiency-optimization",
  "solar-plant-commissioning-robot-integration-checklist":
    "/blog/optimizing-best-pv-panels-commissioning-robot-integration-checklists",
  "waterless-vs-manual-solar-cleaning-cost-10-mw-india":
    "/blog/waterless-robotic-vs-manual-cleaning-cost-comparison-for-10-mw-plant-india",
  "how-to-choose-best-solar-panels":
    "/blog/how-to-choose-best-solar-panels-in-india",
};

export function isRedirectedBlogSlug(slug: string): boolean {
  return REDIRECTED_BLOG_SLUGS.has(slug);
}

export function redirectedBlogTarget(slug: string): string | null {
  return REDIRECTED_BLOG_TARGETS[slug] ?? null;
}

/** Canonical `/blog/...` path for links (avoids 308 from legacy slugs). */
export function canonicalBlogHref(slug: string): string {
  return REDIRECTED_BLOG_TARGETS[slug] ?? `/blog/${slug}`;
}

/** Winning slug after legacy redirects (for hreflang grouping). */
export function canonicalBlogSlug(slug: string): string {
  const href = canonicalBlogHref(slug);
  return href.startsWith("/blog/") ? href.slice("/blog/".length) : slug;
}

/** All legacy slugs that resolve to the same canonical blog post. */
export function blogSlugVariants(slug: string): string[] {
  const canonical = canonicalBlogSlug(slug);
  const variants = new Set<string>([slug, canonical]);
  for (const [legacy, target] of Object.entries(REDIRECTED_BLOG_TARGETS)) {
    if (target === `/blog/${canonical}`) variants.add(legacy);
  }
  return [...variants];
}

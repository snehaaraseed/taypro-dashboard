export interface EnergyResourceCard {
  title: string;
  imgSrc: string;
  date: string;
  href: string;
}

export function extractSlugFromHref(href: string): string {
  // Extract slug from href like "/blog/the-complete-guide-to-solar-panel-maintenance"
  const parts = href.split("/");
  return parts[parts.length - 1]; // Get the last part after the last slash
}

export function findBlogBySlug(
  slug: string,
  energyResourceCards: EnergyResourceCard[]
): EnergyResourceCard | undefined {
  return energyResourceCards.find((blog) => {
    const blogSlug = extractSlugFromHref(blog.href);
    return blogSlug === slug;
  });
}

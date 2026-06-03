export function getBlogFeaturedImageAlt(blog: {
  title: string;
  featuredImageAlt?: string;
}): string {
  const custom = blog.featuredImageAlt?.trim();
  if (custom) return custom;
  return `${blog.title}, solar panel cleaning robot article | Taypro`;
}

export function getProjectHeroImageAlt(project: {
  title: string;
  imageAlt?: string;
  description?: string;
  details?: string[];
}): string {
  const custom = project.imageAlt?.trim();
  if (custom) return custom;
  const overview =
    project.details && project.details.length > 0
      ? project.details.join(" · ")
      : project.description || project.title;
  const snippet =
    overview.length > 50 ? `${overview.substring(0, 50)}...` : overview;
  return `${project.title}, solar panel cleaning robot project, ${snippet}`;
}

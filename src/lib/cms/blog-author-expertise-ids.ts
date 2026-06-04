/** Stable expertise lanes for blog automation matching (shared client + server). */
export const BLOG_AUTHOR_EXPERTISE_TAGS = [
  { id: "om-operations", label: "Plant O&M & operations" },
  { id: "robot-products", label: "Robots & product models" },
  { id: "cleaning-methods", label: "Cleaning methods & technology" },
  { id: "roi-cost", label: "ROI, cost & commercial" },
  { id: "installation", label: "Installation & commissioning" },
  { id: "regional-climate", label: "Regional & climate (India)" },
  { id: "technical", label: "Technical deep dives" },
  { id: "industry-trends", label: "Industry trends & ESG" },
  { id: "field-service", label: "Service, OPEX & fleet ops" },
] as const;

export type BlogAuthorExpertiseTag =
  (typeof BLOG_AUTHOR_EXPERTISE_TAGS)[number]["id"];

export const BLOG_AUTHOR_EXPERTISE_TAG_IDS: BlogAuthorExpertiseTag[] =
  BLOG_AUTHOR_EXPERTISE_TAGS.map((t) => t.id);

import { DynamicBlog } from "../api/blog/list/route";

/** Published project card / case study used for cross-links. */
import type { TayproLocale } from "@/i18n/markets";

export interface ProjectLinkSource {
  slug: string;
  title: string;
  href: string;
  description?: string;
  linkLocale?: TayproLocale;
}

export interface InternalLink {
  keyword: string;
  url: string;
  priority: number; // Higher priority = more important (used first)
}

// Mapping of keywords to pages (excluding blogs - those are handled separately)
const staticPageLinks: InternalLink[] = [
  {
    keyword: "solar panel cleaning robot",
    url: "/solar-panel-cleaning-system",
    priority: 10,
  },
  {
    keyword: "automatic solar panel cleaning robot",
    url: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    priority: 9,
  },
  {
    keyword: "automatic cleaning robot",
    url: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    priority: 8,
  },
  {
    keyword: "semi-automatic cleaning robot",
    url: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    priority: 8,
  },
  {
    keyword: "semi-automatic solar panel cleaning",
    url: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    priority: 8,
  },
  {
    keyword: "single-axis tracker cleaning",
    url: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    priority: 8,
  },
  {
    keyword: "GLYDE",
    url: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    priority: 7,
  },
  {
    keyword: "HELYX",
    url: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    priority: 7,
  },
  {
    keyword: "GLYDE-X",
    url: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    priority: 7,
  },
  {
    keyword: "NYUMA",
    url: "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot",
    priority: 7,
  },
  {
    keyword: "NYUMA-X",
    url: "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot",
    priority: 7,
  },
  {
    keyword: "PBT solar panel cleaning robot",
    url: "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot",
    priority: 8,
  },
  {
    keyword: "single-pass solar panel cleaning",
    url: "/solar-panel-cleaning-system/nyuma-automatic-cleaning-robot",
    priority: 7,
  },
  {
    keyword: "PBT tracker cleaning robot",
    url: "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot",
    priority: 8,
  },
  {
    keyword: "single-pass tracker cleaning",
    url: "/solar-panel-cleaning-system/nyuma-x-single-axis-tracker-cleaning-robot",
    priority: 7,
  },
  {
    keyword: "dual-pass solar panel cleaning",
    url: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    priority: 7,
  },
  {
    keyword: "NECTYR",
    url: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    priority: 8,
  },
  {
    keyword: "monitoring app",
    url: "/solar-panel-cleaning-system/automatic-cleaning-robot-monitoring-app",
    priority: 7,
  },
  {
    keyword: "cleaning service",
    url: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning service",
    url: "/solar-panel-cleaning-system/solar-panel-cleaning-service",
    priority: 8,
  },
  {
    keyword: "ROI calculator",
    url: "/solar-panel-cleaning-robot-price-calculator#calculator",
    priority: 8,
  },
  {
    keyword: "solar panel cleaning robot price",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 9,
  },
  {
    keyword: "solar panel cleaning robot price India",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 9,
  },
  {
    keyword: "solar cleaning robot price",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 8,
  },
  {
    keyword: "buy solar panel cleaning robot India",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 8,
  },
  {
    keyword: "solar panel cleaning robot manufacturer India",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 8,
  },
  {
    keyword: "solar panel cleaning cost",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot supplier",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 7,
  },
  {
    keyword: "utility scale solar operations",
    url: "/utility-scale-solar-operations",
    priority: 8,
  },
  {
    keyword: "solar O&M India",
    url: "/utility-scale-solar-operations",
    priority: 8,
  },
  {
    keyword: "solar plant soiling",
    url: "/utility-scale-solar-operations",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot Rajasthan",
    url: "/solar-panel-cleaning-robot-rajasthan",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot Gujarat",
    url: "/solar-panel-cleaning-robot-gujarat",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot Madhya Pradesh",
    url: "/solar-panel-cleaning-robot-madhya-pradesh",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot Karnataka",
    url: "/solar-panel-cleaning-robot-karnataka",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot Andhra Pradesh",
    url: "/solar-panel-cleaning-robot-andhra-pradesh",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot Maharashtra",
    url: "/solar-panel-cleaning-robot-maharashtra",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot Uttar Pradesh",
    url: "/solar-panel-cleaning-robot-uttar-pradesh",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot Tamil Nadu",
    url: "/solar-panel-cleaning-robot-tamil-nadu",
    priority: 7,
  },
  {
    keyword: "solar panel cleaning robot price India",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 8,
  },
  {
    keyword: "solar panel cleaning robot manufacturer India",
    url: "/solar-panel-cleaning-robot-price-india",
    priority: 7,
  },
  {
    keyword: "ROI",
    url: "/solar-panel-cleaning-robot-price-calculator#calculator",
    priority: 6,
  },
  {
    keyword: "cost calculator",
    url: "/solar-panel-cleaning-robot-price-calculator#calculator",
    priority: 7,
  },
  {
    keyword: "solar projects",
    url: "/projects",
    priority: 7,
  },
  {
    keyword: "solar farm projects",
    url: "/projects",
    priority: 7,
  },
  {
    keyword: "our projects",
    url: "/projects",
    priority: 6,
  },
  {
    keyword: "cleaning technology",
    url: "/cleaning-technology",
    priority: 7,
  },
  {
    keyword: "our technology",
    url: "/cleaning-technology",
    priority: 6,
  },
  {
    keyword: "about Taypro",
    url: "/company",
    priority: 6,
  },
  {
    keyword: "Taypro",
    url: "/company",
    priority: 5,
  },
  {
    keyword: "Taypro vs Solabot",
    url: "/compare/taypro-vs-solabot",
    priority: 9,
  },
  {
    keyword: "Solabot",
    url: "/compare/taypro-vs-solabot",
    priority: 8,
  },
  {
    keyword: "robot vs manual cleaning",
    url: "/compare/solar-panel-cleaning-robot-vs-manual-cleaning",
    priority: 8,
  },
  {
    keyword: "waterless vs water-based cleaning",
    url: "/compare/waterless-vs-water-based-solar-cleaning",
    priority: 7,
  },
  {
    keyword: "Indian solar cleaning robot companies",
    url: "/compare/taypro-vs-indian-solar-cleaning-robot-companies",
    priority: 8,
  },
  {
    keyword: "solar panel cleaning machine",
    url: "/solar-panel-cleaning-machine",
    priority: 9,
  },
  {
    keyword: "cleaning machine",
    url: "/solar-panel-cleaning-machine",
    priority: 8,
  },
  {
    keyword: "rooftop solar panel cleaning robot",
    url: "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot",
    priority: 8,
  },
  {
    keyword: "rooftop solar cleaning",
    url: "/solar-panel-cleaning-system/miny-compact-rooftop-cleaning-robot",
    priority: 7,
  },
  {
    keyword: "solar panel dust cleaning",
    url: "/cleaning-technology",
    priority: 8,
  },
  {
    keyword: "dust cleaning solar panels",
    url: "/cleaning-technology",
    priority: 7,
  },
  {
    keyword: "soiling loss solar",
    url: "/cleaning-technology",
    priority: 7,
  },
];

/**
 * Find relevant blogs based on content similarity
 */
function findRelevantBlogs(
  content: string,
  allBlogs: DynamicBlog[],
  currentSlug: string,
  maxBlogs: number = 3
): InternalLink[] {
  const contentLower = content.toLowerCase();
  const relevantBlogs: Array<{ blog: DynamicBlog; score: number }> = [];

  for (const blog of allBlogs) {
    if (blog.slug === currentSlug) continue; // Skip current blog

    let score = 0;

    // Check title keywords
    const titleLower = blog.title.toLowerCase();
    const titleKeywords = titleLower.split(/\s+/);
    for (const keyword of titleKeywords) {
      if (keyword.length > 3 && contentLower.includes(keyword)) {
        score += 2;
      }
    }

    // Check description keywords
    const descLower = (blog.description || "").toLowerCase();
    const descKeywords = descLower.split(/\s+/);
    for (const keyword of descKeywords) {
      if (keyword.length > 3 && contentLower.includes(keyword)) {
        score += 1;
      }
    }

    // Check for specific topic matches
    if (
      contentLower.includes("robot") &&
      (titleLower.includes("robot") || descLower.includes("robot"))
    ) {
      score += 3;
    }
    if (
      contentLower.includes("cleaning") &&
      (titleLower.includes("cleaning") || descLower.includes("cleaning"))
    ) {
      score += 2;
    }
    if (
      contentLower.includes("efficiency") &&
      (titleLower.includes("efficiency") || descLower.includes("efficiency"))
    ) {
      score += 2;
    }
    if (
      contentLower.includes("maintenance") &&
      (titleLower.includes("maintenance") || descLower.includes("maintenance"))
    ) {
      score += 2;
    }
    if (
      contentLower.includes("installation") &&
      (titleLower.includes("installation") || descLower.includes("installation"))
    ) {
      score += 2;
    }

    if (score > 0) {
      relevantBlogs.push({ blog, score });
    }
  }

  // Sort by score and return top matches
  relevantBlogs.sort((a, b) => b.score - a.score);

  return relevantBlogs.slice(0, maxBlogs).map((item) => ({
    keyword: item.blog.title,
    url: item.blog.href,
    priority: item.score,
  }));
}

function findRelevantProjects(
  content: string,
  allProjects: ProjectLinkSource[],
  currentSlug: string,
  maxProjects: number = 3
): InternalLink[] {
  const contentLower = content.toLowerCase();
  const relevant: Array<{ project: ProjectLinkSource; score: number }> = [];

  for (const project of allProjects) {
    if (project.slug === currentSlug) continue;

    let score = 0;
    const titleLower = project.title.toLowerCase();
    const titleKeywords = titleLower.split(/\s+/);

    for (const keyword of titleKeywords) {
      if (keyword.length > 3 && contentLower.includes(keyword)) {
        score += 2;
      }
    }

    const descLower = (project.description || "").toLowerCase();
    for (const keyword of descLower.split(/\s+/)) {
      if (keyword.length > 3 && contentLower.includes(keyword)) {
        score += 1;
      }
    }

    if (contentLower.includes("mw") && titleLower.includes("mw")) {
      score += 2;
    }
    if (
      contentLower.includes("cleaning") &&
      (titleLower.includes("cleaning") || descLower.includes("cleaning"))
    ) {
      score += 2;
    }
    if (
      contentLower.includes("robot") &&
      (titleLower.includes("robot") || descLower.includes("robot"))
    ) {
      score += 2;
    }
    if (
      contentLower.includes("utility") &&
      (titleLower.includes("utility") || descLower.includes("utility"))
    ) {
      score += 1;
    }

    if (score > 0) {
      relevant.push({ project, score });
    }
  }

  relevant.sort((a, b) => b.score - a.score);

  return relevant.slice(0, maxProjects).map((item) => ({
    keyword: item.project.title,
    url: item.project.href,
    priority: item.score,
  }));
}

/**
 * Extract text from HTML (excluding script, style, and link tags)
 */
function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // Remove HTML tags but keep text content
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();

  return text;
}


/**
 * Find all occurrences of a keyword in HTML content (excluding tags)
 */
function findKeywordMatches(
  html: string,
  keyword: string
): Array<{ start: number; end: number; text: string }> {
  const matches: Array<{ start: number; end: number; text: string }> = [];
  const keywordLower = keyword.toLowerCase();
  const keywordRegex = new RegExp(
    `\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "gi"
  );

  // Create a text-only version and mapping to HTML positions
  let textOnly = "";
  const htmlPositionMap: number[] = []; // Maps text index to HTML position

  let inTag = false;
  let inScript = false;
  let inStyle = false;
  let inLink = false;

  for (let i = 0; i < html.length; i++) {
    const char = html[i];
    const nextChars = html.substring(i, Math.min(i + 7, html.length));

    if (nextChars.startsWith("<script")) {
      inScript = true;
      inTag = true;
    } else if (nextChars.startsWith("</script")) {
      inScript = false;
      inTag = true;
    } else if (nextChars.startsWith("<style")) {
      inStyle = true;
      inTag = true;
    } else if (nextChars.startsWith("</style")) {
      inStyle = false;
      inTag = true;
    } else if (nextChars.startsWith("<a ") || nextChars.startsWith('<a\n') || nextChars.startsWith('<a\t')) {
      inLink = true;
      inTag = true;
    } else if (nextChars.startsWith("</a>")) {
      inLink = false;
      inTag = true;
    } else if (nextChars.startsWith("<code")) {
      inTag = true;
    } else if (nextChars.startsWith("</code")) {
      inTag = false;
    } else if (char === "<") {
      inTag = true;
    } else if (char === ">") {
      inTag = false;
      inScript = false;
      inStyle = false;
      inLink = false;
    }

    if (!inTag && !inScript && !inStyle && !inLink) {
      // Only include visible text characters (not whitespace-only)
      if (char.trim()) {
        htmlPositionMap.push(i);
        textOnly += char.toLowerCase();
      } else if (textOnly.length > 0) {
        // Preserve space between words
        htmlPositionMap.push(i);
        textOnly += " ";
      }
    }
  }

  // Find matches in text-only version and map back to HTML
  let match;
  while ((match = keywordRegex.exec(textOnly)) !== null) {
    const textStart = match.index;
    const textEnd = textStart + match[0].length;

    // Find HTML start position (skip spaces at beginning)
    let htmlStart = -1;
    for (let i = textStart; i < textEnd && i < htmlPositionMap.length; i++) {
      if (textOnly[i] !== " " && htmlPositionMap[i] !== undefined) {
        htmlStart = htmlPositionMap[i];
        break;
      }
    }

    // Find HTML end position
    let htmlEnd = -1;
    for (let i = textEnd - 1; i >= textStart && i >= 0; i--) {
      if (textOnly[i] !== " " && htmlPositionMap[i] !== undefined) {
        htmlEnd = htmlPositionMap[i] + 1;
        break;
      }
    }

    if (htmlStart !== -1 && htmlEnd !== -1 && htmlEnd > htmlStart) {
      const originalText = html.substring(htmlStart, htmlEnd);
      matches.push({
        start: htmlStart,
        end: htmlEnd,
        text: originalText,
      });
    }
  }

  return matches;
}

/**
 * Check if position is inside an HTML tag
 */
function isInsideTagAtPosition(html: string, position: number): boolean {
  // Look backwards for opening tag
  let tagStart = -1;
  let inQuotes = false;
  let quoteChar = "";

  for (let i = position - 1; i >= 0; i--) {
    const char = html[i];

    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
    } else if (!inQuotes && char === ">") {
      // Found tag end, check if it's a closing tag
      if (html.substring(Math.max(0, i - 1), i + 1) === "</") {
        return false; // We're after a closing tag
      }
      tagStart = i + 1;
      break;
    } else if (!inQuotes && char === "<") {
      // Found tag start
      tagStart = i;
      break;
    }
  }

  if (tagStart === -1) return false;

  // Look forwards for closing tag
  for (let i = position; i < html.length; i++) {
    const char = html[i];
    if (char === "<" && html.substring(i, i + 2) === "</") {
      // Found closing tag
      const tagNameEnd = html.indexOf(">", i);
      if (tagNameEnd !== -1) {
        return true; // We're inside a tag
      }
    } else if (char === ">") {
      return false; // Tag ended before closing tag
    }
  }

  return false;
}

type MatchWithLink = {
  match: { start: number; end: number; text: string };
  link: InternalLink;
  position: number;
};

function collectPageLinkMatches(
  processedContent: string
): MatchWithLink[] {
  const pageMatches: MatchWithLink[] = [];
  const pageUrlMatchMap = new Map<string, MatchWithLink[]>();

  for (const link of staticPageLinks) {
    const matches = findKeywordMatches(processedContent, link.keyword);

    for (const match of matches) {
      if (!isInsideTagAtPosition(processedContent, match.start)) {
        const matchWithLink: MatchWithLink = {
          match,
          link,
          position: match.start,
        };

        if (!pageUrlMatchMap.has(link.url)) {
          pageUrlMatchMap.set(link.url, []);
        }
        pageUrlMatchMap.get(link.url)!.push(matchWithLink);
      }
    }
  }

  for (const matches of pageUrlMatchMap.values()) {
    matches.sort((a, b) => {
      if (b.link.priority !== a.link.priority) {
        return b.link.priority - a.link.priority;
      }
      return a.position - b.position;
    });

    if (matches.length > 0) {
      pageMatches.push(matches[0]);
    }
  }

  return pageMatches;
}

function collectSecondaryLinkMatches(
  processedContent: string,
  secondaryLinks: InternalLink[]
): MatchWithLink[] {
  const secondaryMatches: MatchWithLink[] = [];
  const urlMatchMap = new Map<string, MatchWithLink[]>();

  for (const link of secondaryLinks) {
    const matches = findKeywordMatches(processedContent, link.keyword);

    for (const match of matches) {
      if (!isInsideTagAtPosition(processedContent, match.start)) {
        const matchWithLink: MatchWithLink = {
          match,
          link,
          position: match.start,
        };

        if (!urlMatchMap.has(link.url)) {
          urlMatchMap.set(link.url, []);
        }
        urlMatchMap.get(link.url)!.push(matchWithLink);
      }
    }
  }

  for (const matches of urlMatchMap.values()) {
    matches.sort((a, b) => {
      if (b.link.priority !== a.link.priority) {
        return b.link.priority - a.link.priority;
      }
      return a.position - b.position;
    });

    if (matches.length > 0) {
      secondaryMatches.push(matches[0]);
    }
  }

  return secondaryMatches;
}

function injectDistributedInternalLinks(
  content: string,
  pageLinkCount: number,
  secondaryLinks: InternalLink[],
  secondaryLinkCount: number,
  targetLinkCount: number
): string {
  if (!content || content.trim().length === 0) {
    return content;
  }

  const processedContent = content;
  const pageMatches = collectPageLinkMatches(processedContent);
  const secondaryMatches = collectSecondaryLinkMatches(
    processedContent,
    secondaryLinks
  );

  pageMatches.sort((a, b) => a.position - b.position);
  secondaryMatches.sort((a, b) => a.position - b.position);

  const selectedPageMatches = pageMatches.slice(0, pageLinkCount);
  const selectedSecondaryMatches = secondaryMatches.slice(0, secondaryLinkCount);
  const allSelectedMatches = [
    ...selectedPageMatches,
    ...selectedSecondaryMatches,
  ];

  const contentLength = processedContent.length;
  const finalSelectedMatches: MatchWithLink[] = [];
  const usedUrls = new Set<string>();
  const selectedPositions = new Set<number>();

  if (allSelectedMatches.length > 0) {
    const targetSections = Math.min(allSelectedMatches.length, targetLinkCount);
    const sectionSize = contentLength / (targetSections + 1);
    const targetPositions: number[] = [];

    for (let i = 1; i <= targetSections; i++) {
      targetPositions.push(Math.floor(sectionSize * i));
    }

    for (const targetPos of targetPositions) {
      let closestMatch: MatchWithLink | null = null;
      let closestDistance = Infinity;

      for (const matchWithLink of allSelectedMatches) {
        if (usedUrls.has(matchWithLink.link.url)) continue;
        if (selectedPositions.has(matchWithLink.position)) continue;

        const distance = Math.abs(matchWithLink.position - targetPos);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestMatch = matchWithLink;
        }
      }

      if (closestMatch) {
        finalSelectedMatches.push(closestMatch);
        selectedPositions.add(closestMatch.position);
        usedUrls.add(closestMatch.link.url);
      }
    }
  }

  finalSelectedMatches.sort((a, b) => b.position - a.position);

  let resultContent = processedContent;
  for (const { match, link } of finalSelectedMatches) {
    const before = resultContent.substring(0, match.start);
    const after = resultContent.substring(match.end);
    const linkHtml = `<a href="${link.url}" class="internal-link" title="${link.keyword}">${match.text}</a>`;
    resultContent = before + linkHtml + after;
  }

  return resultContent;
}

/**
 * Add internal links to blog content, evenly distributed throughout
 * Distribution: 5 links to pages, 3 links to blogs (total 8)
 */
export function addInternalLinks(
  content: string,
  allBlogs: DynamicBlog[],
  currentSlug: string,
  targetLinkCount: number = 8
): string {
  const blogLinks = findRelevantBlogs(content, allBlogs, currentSlug, 5);
  return injectDistributedInternalLinks(content, 5, blogLinks, 3, targetLinkCount);
}

/**
 * Add internal links to project case-study content (same pattern as blogs).
 * Distribution: 5 pillar/product pages, 3 related project case studies (total 8)
 */
export function addInternalLinksToProject(
  content: string,
  allProjects: ProjectLinkSource[],
  currentSlug: string,
  targetLinkCount: number = 8
): string {
  const projectLinks = findRelevantProjects(content, allProjects, currentSlug, 5);
  return injectDistributedInternalLinks(
    content,
    5,
    projectLinks,
    3,
    targetLinkCount
  );
}


import { DynamicBlog } from "../api/blog/list/route";

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
    keyword: "Model-A",
    url: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system",
    priority: 7,
  },
  {
    keyword: "Model-B",
    url: "/solar-panel-cleaning-system/semi-automatic-solar-panel-cleaning-system",
    priority: 7,
  },
  {
    keyword: "Model-T",
    url: "/solar-panel-cleaning-system/automatic-solar-panel-cleaning-system-for-single-axis-trackers",
    priority: 7,
  },
  {
    keyword: "Taypro Console",
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
    url: "/solar-panel-cleaning-robot-price-calculator",
    priority: 8,
  },
  {
    keyword: "ROI",
    url: "/solar-panel-cleaning-robot-price-calculator",
    priority: 6,
  },
  {
    keyword: "cost calculator",
    url: "/solar-panel-cleaning-robot-price-calculator",
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

/**
 * Add internal links to blog content, evenly distributed throughout
 */
export function addInternalLinks(
  content: string,
  allBlogs: DynamicBlog[],
  currentSlug: string,
  targetLinkCount: number = 8
): string {
  // Don't process if content is empty
  if (!content || content.trim().length === 0) {
    return content;
  }

  // Get relevant blogs (more blogs for better distribution)
  const blogLinks = findRelevantBlogs(content, allBlogs, currentSlug, 5);

  // Combine static page links and blog links, sort by priority
  const allLinks: InternalLink[] = [
    ...staticPageLinks,
    ...blogLinks,
  ].sort((a, b) => b.priority - a.priority);

  const usedUrls = new Set<string>();
  let processedContent = content;
  let linkCount = 0;

  // Collect all valid match positions first (grouped by URL to avoid duplicates)
  type MatchWithLink = {
    match: { start: number; end: number; text: string };
    link: InternalLink;
    position: number; // Position in content for sorting
  };
  const allMatches: MatchWithLink[] = [];
  const urlMatchMap = new Map<string, MatchWithLink[]>(); // Group matches by URL

  // Collect all matches for all links, grouped by URL
  for (const link of allLinks) {
    const matches = findKeywordMatches(processedContent, link.keyword);

    for (const match of matches) {
      // Check if we're not inside a tag
      if (!isInsideTagAtPosition(processedContent, match.start)) {
        const matchWithLink: MatchWithLink = {
          match,
          link,
          position: match.start,
        };
        
        // Group by URL
        if (!urlMatchMap.has(link.url)) {
          urlMatchMap.set(link.url, []);
        }
        urlMatchMap.get(link.url)!.push(matchWithLink);
      }
    }
  }

  // For each URL, keep only the best match (highest priority, or first occurrence if same priority)
  for (const [url, matches] of urlMatchMap.entries()) {
    // Sort matches by priority (descending), then by position (ascending)
    matches.sort((a, b) => {
      if (b.link.priority !== a.link.priority) {
        return b.link.priority - a.link.priority;
      }
      return a.position - b.position;
    });
    
    // Only add the first (best) match for each URL to allMatches
    if (matches.length > 0) {
      allMatches.push(matches[0]);
    }
  }

  // Sort matches by position (to ensure even distribution)
  allMatches.sort((a, b) => a.position - b.position);

  // Calculate content length for even distribution
  const contentLength = processedContent.length;
  const targetSections = Math.min(targetLinkCount, allMatches.length);
  const sectionSize = contentLength / (targetSections + 1);

  // Select matches to distribute evenly
  const selectedMatches: MatchWithLink[] = [];
  const selectedPositions = new Set<number>();

  // If we have enough matches, distribute evenly
  if (allMatches.length >= targetLinkCount) {
    // Create target positions for even distribution
    const targetPositions: number[] = [];
    for (let i = 1; i <= targetSections; i++) {
      targetPositions.push(Math.floor(sectionSize * i));
    }

    // For each target position, find the closest match
    for (const targetPos of targetPositions) {
      let closestMatch: MatchWithLink | null = null;
      let closestDistance = Infinity;

      for (const matchWithLink of allMatches) {
        // Skip if URL already used (shouldn't happen now, but keep as safety check)
        if (usedUrls.has(matchWithLink.link.url)) continue;
        // Skip if this exact position was already selected
        if (selectedPositions.has(matchWithLink.position)) continue;

        const distance = Math.abs(matchWithLink.position - targetPos);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestMatch = matchWithLink;
        }
      }

      if (closestMatch && linkCount < targetLinkCount) {
        selectedMatches.push(closestMatch);
        selectedPositions.add(closestMatch.position);
        usedUrls.add(closestMatch.link.url);
        linkCount++;
      }
    }
  } else {
    // If we don't have enough matches, use all available matches
    // Since allMatches already has only one match per URL, we can use them all
    for (const matchWithLink of allMatches) {
      if (linkCount >= targetLinkCount) break;
      // Safety check (shouldn't be needed since we already filtered)
      if (usedUrls.has(matchWithLink.link.url)) continue;

      selectedMatches.push(matchWithLink);
      usedUrls.add(matchWithLink.link.url);
      linkCount++;
    }
  }

  // Sort selected matches by position (descending) to apply from end to start
  // This prevents position shifts when inserting links
  selectedMatches.sort((a, b) => b.position - a.position);

  // Apply links from end to start to maintain correct positions
  for (const { match, link } of selectedMatches) {
    const before = processedContent.substring(0, match.start);
    const after = processedContent.substring(match.end);

    // Create the link with internal-link class for CSS styling
    const linkHtml = `<a href="${link.url}" class="internal-link" title="${link.keyword}">${match.text}</a>`;

    processedContent = before + linkHtml + after;
  }

  return processedContent;
}


import Link from "next/link";
import Image from "next/image";
import { DynamicBlog } from "../api/blog/list/route";

interface SimilarBlogsProps {
  blogs: DynamicBlog[];
  currentSlug?: string;
}

// Stop words to filter out common words
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "will", "with", "the", "this", "but", "they", "have",
  "had", "what", "said", "each", "which", "their", "time", "if",
  "up", "out", "many", "then", "them", "these", "so", "some", "her",
  "would", "make", "like", "into", "him", "has", "two", "more",
  "very", "after", "words", "long", "than", "first", "been", "call",
  "who", "oil", "sit", "now", "find", "down", "day", "did", "get",
  "come", "made", "may", "part", "over", "new", "sound", "take",
  "only", "little", "work", "know", "place", "year", "live", "me",
  "back", "give", "most", "very", "after", "thing", "our", "just",
  "name", "good", "sentence", "man", "think", "say", "great", "where",
  "help", "through", "much", "before", "line", "right", "too", "mean",
  "old", "any", "same", "tell", "boy", "follow", "came", "want",
  "show", "also", "around", "form", "three", "small", "set", "put",
  "end", "does", "another", "well", "large", "must", "big", "even",
  "such", "because", "turn", "here", "why", "ask", "went", "men",
  "read", "need", "land", "different", "home", "us", "move", "try",
  "kind", "hand", "picture", "again", "change", "off", "play", "spell",
  "air", "away", "animal", "house", "point", "page", "letter", "mother",
  "answer", "found", "study", "still", "learn", "should", "america",
  "world", "high", "every", "near", "add", "food", "between", "own",
  "below", "country", "plant", "last", "school", "father", "keep",
  "tree", "never", "start", "city", "earth", "eye", "light", "thought",
  "head", "under", "story", "saw", "left", "don't", "few", "while",
  "along", "might", "close", "something", "seem", "next", "hard",
  "open", "example", "begin", "life", "always", "those", "both",
  "paper", "together", "got", "group", "often", "run", "important",
  "until", "children", "side", "feet", "car", "mile", "night", "walk",
  "white", "sea", "began", "grow", "took", "river", "four", "carry",
  "state", "once", "book", "hear", "stop", "without", "second",
  "later", "miss", "idea", "enough", "eat", "face", "watch", "far",
  "indian", "real", "almost", "let", "above", "girl", "sometimes",
  "mountain", "cut", "young", "talk", "soon", "list", "song", "leave",
  "family", "it's"
]);

// Extract keywords from text
function extractKeywords(text: string): Set<string> {
  // Convert to lowercase and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
    .split(/\s+/)
    .filter((word) => word.length > 2) // Filter short words
    .filter((word) => !STOP_WORDS.has(word)) // Filter stop words
    .filter((word) => !/^\d+$/.test(word)); // Filter pure numbers

  return new Set(words);
}

// Calculate similarity score between two blogs based on keyword overlap
function calculateSimilarity(blog1: DynamicBlog, blog2: DynamicBlog): number {
  // Extract keywords from title and description
  const keywords1 = extractKeywords(`${blog1.title} ${blog1.description}`);
  const keywords2 = extractKeywords(`${blog2.title} ${blog2.description}`);

  // Calculate intersection (common keywords)
  const intersection = new Set(
    [...keywords1].filter((keyword) => keywords2.has(keyword))
  );

  // Calculate union (all unique keywords)
  const union = new Set([...keywords1, ...keywords2]);

  // Jaccard similarity coefficient
  const similarity = union.size > 0 ? intersection.size / union.size : 0;

  // Boost score if title has matching keywords (titles are more important)
  const title1 = extractKeywords(blog1.title);
  const title2 = extractKeywords(blog2.title);
  const titleOverlap = new Set(
    [...title1].filter((keyword) => title2.has(keyword))
  );
  const titleBoost = titleOverlap.size > 0 ? titleOverlap.size * 0.3 : 0;

  return similarity + titleBoost;
}

// Format date consistently for server and client to avoid hydration mismatches
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Use consistent format: Month DD, YYYY (e.g., "January 15, 2025")
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Get similar blogs based on keyword matching
function getSimilarBlogs(
  allBlogs: DynamicBlog[],
  currentSlug?: string
): DynamicBlog[] {
  if (!currentSlug) {
    // If no current slug, return most recent blogs
    return allBlogs.slice(0, 5);
  }

  // Find current blog
  const currentBlog = allBlogs.find((b) => b.slug === currentSlug);
  if (!currentBlog) {
    return allBlogs.filter((b) => b.slug !== currentSlug).slice(0, 5);
  }

  // Calculate similarity scores for all other blogs
  const blogsWithScores = allBlogs
    .filter((b) => b.slug !== currentSlug)
    .map((blog) => ({
      blog,
      score: calculateSimilarity(currentBlog, blog),
      publishDate: new Date(blog.publishDate).getTime(), // For deterministic sorting
    }))
    .sort((a, b) => {
      // Primary sort: by similarity score (highest first)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Secondary sort: by publish date (most recent first) for deterministic ordering
      return b.publishDate - a.publishDate;
    })
    .slice(0, 5) // Take top 5
    .map((item) => item.blog); // Extract just the blog objects

  // If we don't have enough similar blogs (score > 0), fall back to most recent
  if (blogsWithScores.length < 5) {
    const recentBlogs = allBlogs
      .filter((b) => b.slug !== currentSlug && !blogsWithScores.some((sb) => sb.slug === b.slug))
      .map((blog) => ({
        blog,
        publishDate: new Date(blog.publishDate).getTime(),
      }))
      .sort((a, b) => b.publishDate - a.publishDate)
      .slice(0, 5 - blogsWithScores.length)
      .map((item) => item.blog);

    return [...blogsWithScores, ...recentBlogs].slice(0, 5);
  }

  return blogsWithScores;
}

export function SimilarBlogs({ blogs, currentSlug }: SimilarBlogsProps) {
  // Get similar blogs based on keyword matching
  const similarBlogs = getSimilarBlogs(blogs, currentSlug);

  if (similarBlogs.length === 0) {
    return null;
  }

  return (
    <aside className="lg:w-80 flex-shrink-0">
      <div className="sticky top-24">
        <h3 className="text-2xl font-semibold text-[#052638] mb-6">
          Similar Blogs
        </h3>
        <div className="space-y-6">
          {similarBlogs.map((similarBlog) => (
            <Link
              key={similarBlog.slug}
              href={similarBlog.href}
              className="block group"
            >
              <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={similarBlog.featuredImage}
                    alt={`${similarBlog.title} - Similar blog article`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 320px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-[#052638] mb-2 line-clamp-2 group-hover:text-[#A8C117] transition-colors">
                    {similarBlog.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {similarBlog.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatDate(similarBlog.publishDate)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}


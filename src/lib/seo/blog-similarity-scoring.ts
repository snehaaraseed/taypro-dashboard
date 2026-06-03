/** Client-safe blog keyword similarity (no Node crypto). */

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
  "family", "it's",
]);

export type BlogSimilarityInput = {
  title: string;
  description: string;
  slug?: string;
};

export function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word))
    .filter((word) => !/^\d+$/.test(word));

  return new Set(words);
}

export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

export function calculateBlogSimilarity(
  a: BlogSimilarityInput,
  b: BlogSimilarityInput
): number {
  const keywords1 = extractKeywords(`${a.title} ${a.description}`);
  const keywords2 = extractKeywords(`${b.title} ${b.description}`);
  const similarity = jaccardSimilarity(keywords1, keywords2);

  const title1 = extractKeywords(a.title);
  const title2 = extractKeywords(b.title);
  const titleOverlap = new Set(
    [...title1].filter((keyword) => title2.has(keyword))
  );
  const titleBoost = titleOverlap.size > 0 ? titleOverlap.size * 0.3 : 0;

  return similarity + titleBoost;
}

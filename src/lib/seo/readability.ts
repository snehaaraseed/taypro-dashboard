export type ReadabilityMetrics = {
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  averageSentenceWords: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
};

export type ReadabilityAssessment = {
  metrics: ReadabilityMetrics;
  warnings: string[];
  blockers: string[];
};

const HARD_GRADE_BLOCK = 16;
const HARD_AVG_SENTENCE_WORDS_BLOCK = 34;
const WARNING_GRADE = 13;
const WARNING_AVG_SENTENCE_WORDS = 28;
const WARNING_READING_EASE = 42;

function stripHtml(htmlOrText: string): string {
  return htmlOrText
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function wordsFromText(text: string): string[] {
  return (
    text
      .toLowerCase()
      .match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g) ?? []
  );
}

function sentencesFromText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [];
  if (sentences.length > 0) return sentences.map((s) => s.trim());
  return text.trim() ? [text.trim()] : [];
}

function countSyllables(word: string): number {
  const clean = word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/(?:e|es|ed)$/i, "");
  if (!clean) return 1;

  const groups = clean.match(/[aeiouy]+/g) ?? [];
  return Math.max(1, groups.length);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeReadabilityMetrics(htmlOrText: string): ReadabilityMetrics {
  const text = stripHtml(htmlOrText);
  const words = wordsFromText(text);
  const sentences = sentencesFromText(text);
  const wordCount = words.length;
  const sentenceCount = Math.max(1, sentences.length);
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (wordCount === 0) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      averageSentenceWords: 0,
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
    };
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / wordCount;

  return {
    wordCount,
    sentenceCount,
    syllableCount,
    averageSentenceWords: round1(wordsPerSentence),
    fleschReadingEase: round1(
      206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord
    ),
    fleschKincaidGrade: round1(
      0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
    ),
  };
}

export function assessReadability(htmlOrText: string): ReadabilityAssessment {
  const metrics = computeReadabilityMetrics(htmlOrText);
  const warnings: string[] = [];
  const blockers: string[] = [];

  if (metrics.wordCount < 80) {
    return { metrics, warnings, blockers };
  }

  if (metrics.fleschKincaidGrade > WARNING_GRADE) {
    warnings.push(
      `Readability dense: Flesch-Kincaid grade ${metrics.fleschKincaidGrade} (B2B target ≤${WARNING_GRADE})`
    );
  }
  if (metrics.averageSentenceWords > WARNING_AVG_SENTENCE_WORDS) {
    warnings.push(
      `Average sentence length ${metrics.averageSentenceWords} words (target ≤${WARNING_AVG_SENTENCE_WORDS})`
    );
  }
  if (metrics.fleschReadingEase < WARNING_READING_EASE) {
    warnings.push(
      `Flesch Reading Ease ${metrics.fleschReadingEase} (B2B target ≥${WARNING_READING_EASE})`
    );
  }

  if (metrics.fleschKincaidGrade > HARD_GRADE_BLOCK) {
    blockers.push(
      `Readability too dense for publish: Flesch-Kincaid grade ${metrics.fleschKincaidGrade} > ${HARD_GRADE_BLOCK}`
    );
  }
  if (metrics.averageSentenceWords > HARD_AVG_SENTENCE_WORDS_BLOCK) {
    blockers.push(
      `Readability too dense for publish: average sentence length ${metrics.averageSentenceWords} words > ${HARD_AVG_SENTENCE_WORDS_BLOCK}`
    );
  }

  return { metrics, warnings, blockers };
}

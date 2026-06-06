export type BlogFaqItem = {
  question: string;
  answer: string;
};

export function parseBlogFaqs(raw: string | null | undefined): BlogFaqItem[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const q = String((item as BlogFaqItem).question ?? "").trim();
        const a = String((item as BlogFaqItem).answer ?? "").trim();
        if (!q || !a) return null;
        return { question: q, answer: a };
      })
      .filter((item): item is BlogFaqItem => item !== null);
  } catch {
    return [];
  }
}

export function serializeBlogFaqs(faqs: BlogFaqItem[] | undefined): string {
  const cleaned = (faqs ?? [])
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
  return JSON.stringify(cleaned);
}

export function normalizeBlogFaqsInput(
  faqs: unknown
): BlogFaqItem[] {
  if (!Array.isArray(faqs)) return [];
  return faqs
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const q = String((item as BlogFaqItem).question ?? "").trim();
      const a = String((item as BlogFaqItem).answer ?? "").trim();
      if (!q || !a) return null;
      return { question: q, answer: a };
    })
    .filter((item): item is BlogFaqItem => item !== null);
}

function faqQuestionReflectsKeyword(question: string, keyword: string): boolean {
  const q = question.toLowerCase();
  const kw = keyword.toLowerCase().trim();
  if (!kw) return true;
  if (q.includes(kw)) return true;
  const words = kw.split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return true;
  const matched = words.filter((w) => q.includes(w)).length;
  return matched >= Math.max(2, Math.ceil(words.length * 0.5));
}

function buildPrimaryFaqQuestion(keyword: string): string {
  const k = keyword.toLowerCase().trim();
  if (/how often|frequency/.test(k)) {
    return `How often should you schedule ${keyword} on a 50 MW solar plant in India?`;
  }
  if (/cost|price/.test(k)) {
    return `What does ${keyword} cost on utility-scale solar plants in India?`;
  }
  if (/brush|vs|compare/.test(k)) {
    return `How does ${keyword} compare to robotic cleaning on utility-scale solar sites?`;
  }
  const titled = keyword.replace(/\b\w/g, (c) => c.toUpperCase());
  return `How should utility-scale O&M teams approach ${titled} in India?`;
}

/** Ensure faqs[0] includes the primary SEO keyword (validator requirement). */
export function ensurePrimaryKeywordInFirstFaq(
  faqs: BlogFaqItem[],
  primaryKeyword: string | undefined,
  fallbackQuestion?: string
): BlogFaqItem[] {
  if (faqs.length === 0 || !primaryKeyword?.trim()) return faqs;
  const primary = primaryKeyword.trim();
  if (faqQuestionReflectsKeyword(faqs[0].question, primary)) return faqs;

  const fallback = fallbackQuestion?.trim();
  const question =
    fallback && faqQuestionReflectsKeyword(fallback, primary)
      ? fallback
      : buildPrimaryFaqQuestion(primary);

  return [{ ...faqs[0], question }, ...faqs.slice(1)];
}

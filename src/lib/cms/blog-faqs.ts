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

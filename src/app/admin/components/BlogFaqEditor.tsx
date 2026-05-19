"use client";

import type { BlogFaqItem } from "@/lib/cms/blog-faqs";

type BlogFaqEditorProps = {
  faqs: BlogFaqItem[];
  onChange: (faqs: BlogFaqItem[]) => void;
};

const emptyFaq = (): BlogFaqItem => ({ question: "", answer: "" });

export function BlogFaqEditor({ faqs, onChange }: BlogFaqEditorProps) {
  const updateItem = (index: number, patch: Partial<BlogFaqItem>) => {
    onChange(
      faqs.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= faqs.length) return;
    const copy = [...faqs];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-800">FAQs (optional)</p>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            Add question-and-answer pairs for this article. They appear at the
            bottom of the post and in FAQ structured data for SEO. Empty rows are
            ignored when you save.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...faqs, emptyFaq()])}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#052638] hover:bg-gray-50"
        >
          + Add FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-sm text-gray-500 italic rounded-md border border-dashed border-gray-300 px-4 py-6 text-center">
          No FAQs yet. Click &quot;Add FAQ&quot; to add one.
        </p>
      ) : (
        <ul className="space-y-4">
          {faqs.map((faq, index) => (
            <li
              key={index}
              className="rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  FAQ {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === faqs.length - 1}
                    className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateItem(index, { question: e.target.value })}
                  placeholder="e.g. How often should panels be cleaned?"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Answer
                </label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateItem(index, { answer: e.target.value })}
                  placeholder="Short, direct answer for readers and search engines."
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

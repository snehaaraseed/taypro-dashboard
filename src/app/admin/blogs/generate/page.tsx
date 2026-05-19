"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateBlogPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [brief, setBrief] = useState("");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          brief: brief.trim(),
          focusedKeywords: keywords.trim() || undefined,
          saveAsDraft: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate blog");
      }

      const editUrl = data.blog?.adminUrl as string | undefined;
      if (editUrl) {
        setMessage("✅ Blog generated! Opening editor...");
        setTimeout(() => router.push(editUrl), 800);
      } else {
        setMessage("✅ Blog generated successfully.");
      }
    } catch (error) {
      console.error("Generate blog error:", error);
      setMessage(
        `Error: ${
          error instanceof Error ? error.message : "Generation failed. Try again."
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl">
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#052638]">
            Generate Blog with AI
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            Long-form draft (2,600–3,200+ words), 3–5 SEO FAQs, featured +
            inline images, then saved as an unpublished draft for your review.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/blogs")}
          className="shrink-0 flex items-center gap-2 text-gray-600 hover:text-[#052638] transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded ${
            message.includes("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic / working title *
          </label>
          <input
            type="text"
            required
            disabled={isGenerating}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            placeholder="e.g. How dust and soiling reduce solar plant performance in India"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focused keywords <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            disabled={isGenerating}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            placeholder="primary keyword, secondary term, related phrase"
          />
          <p className="mt-1 text-xs text-gray-500">
            Comma-separated. First keyword is primary (title, meta, H2s, FAQs).
            Also used when picking images.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description / brief *
          </label>
          <textarea
            required
            disabled={isGenerating}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            rows={8}
            placeholder="Outline what the post should cover: target reader, key points, comparisons, data to mention, internal links, tone, etc."
          />
          <p className="mt-1 text-xs text-gray-500">
            The more specific your brief, the better the draft. Gemini will still
            add SEO structure, FAQs, and Taypro product facts from the knowledge
            base.
          </p>
        </div>

        {isGenerating && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Generating — this usually takes 1–3 minutes</p>
            <p className="mt-1 text-amber-800">
              Writing content, selecting images, and saving a draft. Please keep
              this tab open.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/blogs/new")}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-md disabled:opacity-50 transition-colors"
          >
            Create manually instead
          </button>
          <button
            type="submit"
            disabled={isGenerating || !topic.trim() || !brief.trim()}
            className="flex-[2] flex items-center justify-center bg-[#A8C117] hover:bg-lime-500 text-white py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Generating draft...
              </span>
            ) : (
              "Generate draft with Gemini"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

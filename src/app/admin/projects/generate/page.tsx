"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateProjectPage() {
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
      const response = await fetch("/api/admin/project/generate", {
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
        throw new Error(data.error || "Failed to generate project");
      }

      const editUrl = data.project?.adminUrl as string | undefined;
      const authorLabel = data.project?.author as string | undefined;
      if (editUrl) {
        setMessage(
          authorLabel
            ? `✅ Project generated (byline: ${authorLabel}). Opening editor...`
            : "✅ Project generated! Opening editor..."
        );
        setTimeout(() => router.push(editUrl), 800);
      } else {
        setMessage(
          authorLabel
            ? `✅ Project generated successfully (byline: ${authorLabel}).`
            : "✅ Project generated successfully."
        );
      }
    } catch (error) {
      console.error("Generate project error:", error);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#052638]">
              Generate Project with AI
            </h1>
            <p className="mt-2 text-gray-600 text-sm">
              Case-study draft (1,000–1,800 words), random author byline (same
              pool as blogs), overview detail chips, hero + inline images, saved
              as unpublished for your review.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
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
              Project title / site name *
            </label>
            <input
              type="text"
              required
              disabled={isGenerating}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              placeholder="e.g. Agar, Madhya Pradesh – 250 MW solar plant"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focused keywords{" "}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              disabled={isGenerating}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              placeholder="solar panel cleaning robot project, 250 MW plant, Madhya Pradesh"
            />
            <p className="mt-1 text-xs text-gray-500">
              Comma-separated. First keyword is primary. Used for SEO and image
              selection.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project brief *
            </label>
            <textarea
              required
              disabled={isGenerating}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              rows={8}
              placeholder="Capacity, location, tracker type, soiling challenge, Taypro solution deployed (GLYDE / HELYX / etc.), outcomes, timeline. Include category tags: Automatic, Semi-Automatic, and/or Capex..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Include real site facts when you have them. State deployment type with
              exact tags Automatic, Semi-Automatic, and/or Capex so the project
              appears on the right category pages. Gemini uses Taypro&apos;s product
              knowledge base and will not invent specs.
            </p>
          </div>

          {isGenerating && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">
                Generating, this usually takes 1–3 minutes
              </p>
              <p className="mt-1 text-amber-800">
                Writing the case study, picking images, and saving a draft.
                Please keep this tab open.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/projects/new")}
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
    </div>
  );
}

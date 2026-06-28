"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminRichTextEditor from "@/app/admin/components/AdminRichTextEditor";

interface InsightForm {
  title: string;
  description: string;
  slug: string;
  content: string;
  published: boolean;
  publishDate: string;
  reportType: string;
  period: string | null;
}

export default function EditInsightPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [form, setForm] = useState<InsightForm>({
    title: "",
    description: "",
    slug: "",
    content: "",
    published: true,
    publishDate: "",
    reportType: "category_pulse",
    period: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (slug) void fetchInsight();
  }, [slug]);

  const fetchInsight = async () => {
    try {
      const response = await fetch(`/api/admin/insight/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          title: data.title,
          description: data.description,
          slug: data.slug,
          content: data.content,
          published: data.published !== false,
          publishDate: data.publishDate,
          reportType: data.reportType,
          period: data.period,
        });
      } else if (response.status === 401) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/insight/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          content: form.content,
          published: form.published,
          publishDate: form.publishDate,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Saved successfully.");
      } else {
        setMessage(data.error ?? "Save failed");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => router.push("/admin/insights")}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Back to insights
      </button>

      <h1 className="text-2xl font-bold text-[#052638] mb-2">Edit insight</h1>
      <p className="text-sm text-gray-500 mb-6">
        {form.reportType} · {form.period ?? "no period"}
      </p>

      {message ? (
        <p className="mb-4 text-sm text-gray-700">{message}</p>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="published"
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm({ ...form, published: e.target.checked })
            }
          />
          <label htmlFor="published" className="text-sm text-gray-700">
            Published
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <AdminRichTextEditor
            initialContent={form.content}
            onContentChange={(content) => setForm({ ...form, content })}
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

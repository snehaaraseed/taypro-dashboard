"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminRichTextEditor from "@/app/admin/components/AdminRichTextEditor";

interface PressForm {
  title: string;
  subhead: string;
  dateline: string;
  slug: string;
  content: string;
  boilerplate: string;
  published: boolean;
  publishDate: string;
  contactName: string;
  contactEmail: string;
}

export default function EditPressReleasePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [form, setForm] = useState<PressForm>({
    title: "",
    subhead: "",
    dateline: "",
    slug: "",
    content: "",
    boilerplate: "",
    published: false,
    publishDate: "",
    contactName: "",
    contactEmail: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (slug) void fetchRelease();
  }, [slug]);

  const fetchRelease = async () => {
    try {
      const response = await fetch(`/api/admin/press/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setForm({
          title: data.title,
          subhead: data.subhead,
          dateline: data.dateline,
          slug: data.slug,
          content: data.content,
          boilerplate: data.boilerplate,
          published: data.published === true,
          publishDate: data.publishDate,
          contactName: data.contact?.name ?? "",
          contactEmail: data.contact?.email ?? "",
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
      const response = await fetch(`/api/admin/press/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subhead: form.subhead,
          dateline: form.dateline,
          content: form.content,
          boilerplate: form.boilerplate,
          published: form.published,
          publishDate: form.publishDate,
          contact: { name: form.contactName, email: form.contactEmail },
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#052638]">Edit press release</h1>
        <button
          type="button"
          onClick={() => router.push("/admin/press")}
          className="text-sm text-blue-600 hover:underline"
        >
          Back to list
        </button>
      </div>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subhead</label>
          <input
            type="text"
            value={form.subhead}
            onChange={(e) => setForm({ ...form, subhead: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dateline</label>
          <input
            type="text"
            value={form.dateline}
            onChange={(e) => setForm({ ...form, dateline: e.target.value })}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Pune, India — June 28, 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Body</label>
          <AdminRichTextEditor
            initialContent={form.content}
            onContentChange={(content: string) => setForm({ ...form, content })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Boilerplate</label>
          <textarea
            value={form.boilerplate}
            onChange={(e) => setForm({ ...form, boilerplate: e.target.value })}
            rows={4}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact name</label>
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Published</span>
          </label>
        </div>

        {message ? (
          <p
            className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}

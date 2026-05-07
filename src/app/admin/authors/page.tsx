"use client";

import { useEffect, useState } from "react";
import { slugifyAuthorName } from "../../data/blogAuthors";

interface Author {
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatarUrl?: string;
}

const EMPTY_FORM = {
  name: "",
  role: "",
  bio: "",
  avatarUrl: "",
};

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAuthors = async () => {
    try {
      const response = await fetch("/api/admin/authors");
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await response.json();
      setAuthors(data.authors || []);
    } catch {
      setMessage("Failed to load authors.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: slugifyAuthorName(form.name),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save author");
      }
      setAuthors(data.authors || []);
      setForm(EMPTY_FORM);
      setMessage("Author saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save author.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this author?")) return;
    try {
      const response = await fetch(`/api/admin/authors/${slug}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete author");
      }
      setAuthors(data.authors || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete author.");
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading authors...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[#052638]">Authors</h1>
      </div>

      {message && (
        <div className="rounded-md bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-[#052638]">Add Author</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Author name"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            required
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="Role"
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <input
          value={form.avatarUrl}
          onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
          placeholder="Avatar URL (optional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <textarea
          required
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Short bio"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#A8C117] hover:bg-lime-500 text-white px-5 py-2 rounded-md disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Author"}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {authors.map((author) => (
              <tr key={author.slug}>
                <td className="px-6 py-4 text-sm text-gray-900">{author.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{author.role}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{author.slug}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(author.slug)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


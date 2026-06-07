"use client";

import { getAuthorAvatarUrl } from "@/app/data/blogAuthors";
import { useEffect, useState } from "react";
import Image from "next/image";
import { slugifyAuthorName } from "../../data/blogAuthors";
import {
  BLOG_AUTHOR_EXPERTISE_TAGS,
  type BlogAuthorExpertiseTag,
} from "@/lib/cms/blog-author-expertise-ids";

interface Author {
  name: string;
  slug: string;
  role: string;
  bio: string;
  expertiseTags?: BlogAuthorExpertiseTag[];
  avatarUrl?: string;
  linkedInUrl?: string;
}

const EMPTY_FORM = {
  name: "",
  role: "",
  bio: "",
  expertiseTags: [] as BlogAuthorExpertiseTag[],
  avatarUrl: "",
  linkedInUrl: "",
};

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setMessage("Please upload a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Image must be 10MB or smaller.");
      return;
    }

    setUploadingAvatar(true);
    setMessage("");
    try {
      let fileToUpload = file;
      if (!file.name?.trim()) {
        const ext = file.type.split("/")[1] || "png";
        fileToUpload = new File([file], `avatar-${Date.now()}.${ext}`, { type: file.type });
      }
      const fd = new FormData();
      fd.append("file", fileToUpload);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }
      setForm((prev) => ({ ...prev, avatarUrl: data.url as string }));
      setMessage("Profile picture uploaded.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const clearAvatar = () => {
    setForm((prev) => ({ ...prev, avatarUrl: "" }));
  };

  const toggleExpertise = (tagId: BlogAuthorExpertiseTag) => {
    setForm((prev) => {
      const has = prev.expertiseTags.includes(tagId);
      return {
        ...prev,
        expertiseTags: has
          ? prev.expertiseTags.filter((t) => t !== tagId)
          : [...prev.expertiseTags, tagId],
      };
    });
  };

  const startEdit = (author: Author) => {
    setEditingSlug(author.slug);
    setForm({
      name: author.name,
      role: author.role,
      bio: author.bio,
      expertiseTags: author.expertiseTags ?? [],
      avatarUrl: author.avatarUrl || "",
      linkedInUrl: author.linkedInUrl || "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setMessage("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const slugForSave = editingSlug ?? slugifyAuthorName(form.name);
      const response = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: slugForSave,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save author");
      }
      setAuthors(data.authors || []);
      setForm(EMPTY_FORM);
      setEditingSlug(null);
      const propagated = data.propagated as
        | { blogs: number; projects: number }
        | null
        | undefined;
      const cascadeNote =
        propagated && (propagated.blogs > 0 || propagated.projects > 0)
          ? ` Updated ${propagated.blogs} blog(s) and ${propagated.projects} project(s) with the new name.`
          : "";
      setMessage(
        editingSlug
          ? `Author updated.${cascadeNote}`
          : `Author saved successfully.${cascadeNote}`
      );
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
      if (editingSlug === slug) cancelEdit();
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#052638]">
            {editingSlug ? "Edit author" : "Add author"}
          </h2>
          {editingSlug && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Cancel edit
            </button>
          )}
        </div>
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

        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-800">Profile picture</p>
          <p className="text-xs text-gray-500">
            Upload an image file. It is stored on your site (same upload as blog images). No external avatar URL is required.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center px-4 py-2 bg-[#052638] text-white rounded-md hover:bg-[#0c3c57] cursor-pointer text-sm disabled:opacity-50">
              {uploadingAvatar ? "Uploading…" : "Choose image"}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
            {form.avatarUrl ? (
              <>
                <button
                  type="button"
                  onClick={clearAvatar}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove photo
                </button>
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                  <Image
                    src={form.avatarUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={form.avatarUrl.startsWith("/uploads/")}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>

        <textarea
          required
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Short bio"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />

        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-gray-800">
            Blog automation expertise
          </p>
          <p className="text-xs text-gray-500">
            Daily posts match keyword + category to these lanes. Leave empty to
            infer from role and bio.
          </p>
          <div className="flex flex-wrap gap-2">
            {BLOG_AUTHOR_EXPERTISE_TAGS.map((tag) => {
              const active = form.expertiseTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleExpertise(tag.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-[#052638] text-white border-[#052638]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#052638]"
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn profile (optional)
          </label>
          <input
            type="url"
            value={form.linkedInUrl}
            onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })}
            placeholder="https://www.linkedin.com/in/your-profile"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be a valid https link on linkedin.com. Shown on the public author page.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#A8C117] hover:bg-lime-500 text-white px-5 py-2 rounded-md disabled:opacity-50"
        >
          {isSaving ? "Saving…" : editingSlug ? "Update author" : "Save author"}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Expertise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {authors.map((author) => {
              const avatarSrc =
                author.avatarUrl || getAuthorAvatarUrl(author.name);
              return (
              <tr key={author.slug}>
                <td className="px-4 py-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    <Image
                      src={avatarSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized={
                        avatarSrc.startsWith("/uploads/") ||
                        avatarSrc.startsWith("http")
                      }
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{author.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{author.role}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  {(author.expertiseTags?.length ?? 0) > 0
                    ? author.expertiseTags!
                        .map(
                          (id) =>
                            BLOG_AUTHOR_EXPERTISE_TAGS.find((t) => t.id === id)
                              ?.label ?? id
                        )
                        .join(", ")
                    : "Inferred from bio"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{author.slug}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    type="button"
                    onClick={() => startEdit(author)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(author.slug)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

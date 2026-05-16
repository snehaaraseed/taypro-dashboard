"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useParams } from "next/navigation";
import {
  summarizeTranslateBlogResults,
  translateBlogAllLocales,
} from "@/app/admin/utils/translate-blog";

const BlogEditor = dynamic(() => import("../../../../components/BlogEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center justify-center h-96 bg-white">
        <div className="flex space-x-2">
          <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce"></span>
          <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-100"></span>
          <span className="dot w-3 h-3 bg-gray-500 rounded-full animate-bounce delay-200"></span>
        </div>
      </div>
    </div>
  ),
});

interface BlogData {
  title: string;
  description: string;
  featuredImage: string;
  featuredImageAlt?: string;
  author: string;
  slug: string;
  publishDate: string;
  content: string;
  published?: boolean;
  /** ISO; from metadata, refreshed after save */
  updatedAt?: string;
}

type TranslationSyncInfo = {
  allSynced: boolean;
  locales: { locale: string; synced: boolean }[];
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [formData, setFormData] = useState<BlogData>({
    title: "",
    description: "",
    featuredImage: "",
    featuredImageAlt: "",
    author: "Taypro Team",
    slug: "",
    publishDate: new Date().toISOString().split("T")[0],
    content: "",
    published: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; name: string }>>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("Taypro Team");
  const [authors, setAuthors] = useState<Array<{ name: string; slug: string; role: string }>>([]);
  const [translationSync, setTranslationSync] = useState<TranslationSyncInfo | null>(
    null
  );

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch("/api/authors");
        const data = await response.json();
        setAuthors(data.authors || []);
      } catch {
        setAuthors([{ name: "Taypro Team", slug: "taypro-team", role: "Solar Automation Specialists" }]);
      }
    };
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (!formData.author) return;
    const isPresetAuthor = authors.some((author) => author.name === formData.author);
    setSelectedAuthor(isPresetAuthor ? formData.author : "__custom__");
  }, [authors, formData.author]);

  const [translateLoading, setTranslateLoading] = useState(false);

  const handleTranslateLocales = async (force: boolean) => {
    if (formData.published === false) {
      setMessage(
        "Publish the blog first. Translations are generated from the English published version."
      );
      return;
    }
    const slugForApi = slug;
    const msg = force
      ? "Re-translate all languages from current English (overwrites existing). Continue?"
      : "Translate into hi, ar, ja, and bn from English? This uses Gemini and may take a minute.";
    if (!confirm(msg)) return;

    setTranslateLoading(true);
    setMessage("");
    try {
      const data = await translateBlogAllLocales(slugForApi, { force });
      const summary = summarizeTranslateBlogResults(data);
      setMessage(
        data.success
          ? `✅ Translation successful.\n${summary}`
          : `⚠️ Translation finished with errors.\n${summary}`
      );
      await fetchBlog();
    } catch (e) {
      setMessage(
        `❌ ${e instanceof Error ? e.message : "Translation failed"}`
      );
    } finally {
      setTranslateLoading(false);
    }
  };

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/admin/blog/${slug}`);
      if (response.ok) {
        const json = (await response.json()) as BlogData & {
          translationSync?: TranslationSyncInfo;
        };
        const { translationSync: sync, ...rest } = json;
        setTranslationSync(
          sync && typeof sync === "object" && "allSynced" in sync ? sync : null
        );
        setFormData({
          ...rest,
          slug: rest.slug || slug,
          publishDate: rest.publishDate
            ? new Date(rest.publishDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          published:
            rest.published !== undefined ? rest.published : true,
        });
      } else {
        if (response.status === 401) {
          router.push("/admin/login");
        } else {
          setMessage("Failed to load blog. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      setMessage("An error occurred while loading the blog.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, featuredImage: url });

    if (!url) {
      setImageError(false);
      setImageLoading(false);
    } else if (isValidUrl(url) || url.startsWith("/")) {
      setImageLoading(true);
      setImageError(false);
    } else {
      setImageLoading(false);
      setImageError(true);
    }
  };

  const handleImageLoadSuccess = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageLoadError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const fetchGalleryImages = async () => {
    setLoadingGallery(true);
    try {
      const response = await fetch("/api/admin/upload/list");
      const data = await response.json();
      if (response.ok && data.images) {
        console.log(`Gallery: Loaded ${data.images.length} images`);
        setGalleryImages(data.images);
      } else {
        console.error("Gallery API error:", data);
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (showGallery) {
      fetchGalleryImages();
    }
  }, [showGallery]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setMessage("Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage("File size exceeds 10MB limit. Please choose a smaller image.");
      return;
    }

    setUploadingImage(true);
    setMessage("");

    try {
      // Ensure file has a valid name
      let fileToUpload = file;
      if (!file.name || file.name.trim() === "") {
        // Create a new File object with a valid name
        const extension = file.type.split("/")[1] || "png";
        const timestamp = Date.now();
        fileToUpload = new File([file], `image-${timestamp}.${extension}`, {
          type: file.type,
        });
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", fileToUpload);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFormData,
      });

      // Handle 413 error specifically
      if (response.status === 413) {
        setMessage("❌ File is too large. Maximum size is 10MB. Please compress or resize your image before uploading.");
        return;
      }

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, it might be a server error
        throw new Error(`Server error (${response.status}). Please try again or use a smaller image.`);
      }

      if (response.ok && data.url) {
        setFormData((prev) => ({ ...prev, featuredImage: data.url }));
        setImageError(false);
        setMessage("✅ Image uploaded successfully!");
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Please try again.";
      
      // Provide more specific error messages
      if (errorMessage.includes("413") || errorMessage.includes("too large")) {
        setMessage("❌ File is too large. Maximum size is 10MB. Please compress or resize your image.");
      } else if (errorMessage.includes("pattern")) {
        setMessage("❌ Invalid file format. Please ensure the file is a valid image file.");
      } else {
        setMessage(`Error uploading image: ${errorMessage}`);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    if (!formData.slug.trim()) {
      setMessage("URL slug is required.");
      setIsSaving(false);
      return;
    }

    try {
      const publishDateISO = formData.publishDate
        ? new Date(formData.publishDate).toISOString()
        : new Date().toISOString();

      const response = await fetch(`/api/admin/blog/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          featuredImage: formData.featuredImage,
          featuredImageAlt: formData.featuredImageAlt ?? "",
          author: formData.author,
          content: formData.content,
          publishDate: publishDateISO,
          published: formData.published,
          newSlug: formData.slug.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Blog updated successfully! Redirecting...");
        const nextSlug = data.slug as string | undefined;
        if (typeof data.updatedAt === "string") {
          setFormData((prev) => ({ ...prev, updatedAt: data.updatedAt }));
        }
        if (data.translationSync && typeof data.translationSync === "object") {
          setTranslationSync(data.translationSync as TranslationSyncInfo);
        }
        setTimeout(() => {
          if (nextSlug && nextSlug !== slug) {
            router.replace(`/admin/blogs/${nextSlug}/edit`);
          } else {
            router.push("/admin/blogs");
          }
        }, 800);
      } else {
        throw new Error(data.error || "Failed to update blog");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setMessage(
        `Error updating blog: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-[#052638]">Edit Blog</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#052638] transition-colors"
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
            message.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter blog title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL slug *
          </label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
              /blog/
            </span>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, "-")
                    .replace(/-+/g, "-"),
                })
              }
              className="flex-1 min-w-0 rounded-r-md border border-gray-300 px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your-post-url"
              spellCheck={false}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Changing the slug updates the public URL. Old links will stop working unless you add redirects elsewhere.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter blog description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          
          {/* Upload and Gallery Buttons */}
          <div className="mb-3 flex gap-2 flex-wrap">
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {uploadingImage ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowGallery(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Select from Gallery
            </button>
            <span className="ml-3 text-sm text-gray-500 self-center">
              Or enter image URL below
            </span>
          </div>

          {/* URL Input */}
          <input
            type="text"
            value={formData.featuredImage}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
              imageError && formData.featuredImage
                ? "border-red-500 focus:ring-red-400"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="https://res.cloudinary.com/your-image-url or /uploads/..."
          />

          {formData.featuredImage && !formData.featuredImage.startsWith("/") && !isValidUrl(formData.featuredImage) && (
            <p className="mt-1 text-sm text-red-500">
              ⚠️ Invalid URL format. Must start with http://, https://, or /
            </p>
          )}

          {imageError && (isValidUrl(formData.featuredImage) || formData.featuredImage.startsWith("/")) && (
            <p className="mt-1 text-sm text-red-500">
              ❌ Failed to load image. Check if the URL is accessible.
            </p>
          )}

          {/* Image Preview */}
          {formData.featuredImage &&
            (isValidUrl(formData.featuredImage) || formData.featuredImage.startsWith("/")) &&
            !imageError && (
              <div className="mt-4 relative">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md z-10">
                    <div className="flex space-x-2">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div className="relative w-full h-60 rounded-md overflow-hidden border border-gray-300 bg-gray-100">
                  <Image
                    src={formData.featuredImage}
                    alt="Featured image preview"
                    fill
                    className="object-cover"
                    onLoadingComplete={handleImageLoadSuccess}
                    onError={handleImageLoadError}
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized={formData.featuredImage.startsWith("/uploads/")}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      featuredImage: "",
                      featuredImageAlt: "",
                    });
                    setImageError(false);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured image alt text
            </label>
            <input
              type="text"
              value={formData.featuredImageAlt ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, featuredImageAlt: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the image for accessibility and SEO"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to use an auto-generated description from the blog title.
            </p>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published !== false}
              onChange={(e) =>
                setFormData({ ...formData, published: e.target.checked })
              }
              className="w-5 h-5 text-[#A8C117] border-gray-300 rounded focus:ring-[#A8C117]"
            />
            <div>
              <span className="block text-sm font-medium text-gray-700">
                Publish Blog
              </span>
              <span className="text-xs text-gray-500">
                {formData.published !== false
                  ? "This blog will be visible on the website"
                  : "Save as draft - won't appear on the website"}
              </span>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author
          </label>
          <div className="space-y-3">
            <select
              value={selectedAuthor}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedAuthor(value);
                if (value !== "__custom__") {
                  setFormData({ ...formData, author: value });
                }
              }}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {authors.map((author) => (
                <option key={author.slug} value={author.name}>
                  {author.name} - {author.role}
                </option>
              ))}
              <option value="__custom__">Custom author</option>
            </select>

            {selectedAuthor === "__custom__" && (
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Enter custom author name"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Published date
          </label>
          <input
            type="date"
            value={formData.publishDate}
            onChange={(e) =>
              setFormData({ ...formData, publishDate: e.target.value })
            }
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Original publication date (used for SEO and sorting). The public blog shows last updated only.
          </p>
        </div>

        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm font-medium text-gray-800">Last updated</p>
          <p className="text-sm text-gray-600 mt-1">
            {formData.updatedAt
              ? new Date(formData.updatedAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "— (appears after the next save)"}
          </p>
        </div>

        <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 space-y-3">
          <p className="text-sm font-medium text-[#052638]">
            Translations (hi, ar, ja, bn)
          </p>
          {formData.published && translationSync?.allSynced ? (
            <>
              <p className="text-sm text-gray-600">
                All languages are up to date with this English version. Saving
                changes to a published post automatically queues translation
                updates in the background.
              </p>
              <div className="rounded border border-green-200 bg-green-50/80 px-3 py-2 text-xs text-green-900">
                Synced:{" "}
                {translationSync.locales
                  .filter((l) => l.synced)
                  .map((l) => l.locale)
                  .join(", ")}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Uses the English version of this post and Gemini to fill or
                update localized pages. Saving a published post also triggers
                translation updates automatically.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={translateLoading || formData.published === false}
                  onClick={() => handleTranslateLocales(false)}
                  className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {translateLoading ? "Working…" : "Translate all languages"}
                </button>
                <button
                  type="button"
                  disabled={translateLoading || formData.published === false}
                  onClick={() => handleTranslateLocales(true)}
                  className="inline-flex items-center justify-center rounded-md border border-sky-600 bg-white px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Ignore cache and regenerate every locale from English"
                >
                  Force re-translate all
                </button>
              </div>
              {translationSync &&
                !translationSync.allSynced &&
                formData.published && (
                  <p className="text-xs text-gray-600">
                    Out of date:{" "}
                    {translationSync.locales
                      .filter((l) => !l.synced)
                      .map((l) => l.locale)
                      .join(", ")}
                  </p>
                )}
            </>
          )}
          {formData.published === false && (
            <p className="text-xs text-amber-800">
              Publish this post first to enable translation.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <div className="bg-white border border-gray-300 rounded-md p-2">
            <BlogEditor
              key={slug}
              onContentChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              initialContent={formData.content}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              isSaving ||
              !formData.title ||
              !formData.description ||
              !formData.content ||
              (!!formData.featuredImage &&
                (imageError || (!isValidUrl(formData.featuredImage) && !formData.featuredImage.startsWith("/"))))
            }
            className="w-full flex items-center justify-center bg-[#A8C117] hover:bg-lime-500 text-white py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isSaving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </div>
            ) : (
              "Update Blog"
            )}
          </button>
        </div>
      </form>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Select Featured Image from Gallery</h3>
            
            {loadingGallery ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                <span className="ml-3 text-gray-600">Loading gallery...</span>
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No images found in gallery.</p>
                <p className="text-sm mt-2">Upload images using the Upload button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setFormData({ ...formData, featuredImage: img.url });
                      setImageError(false);
                      setShowGallery(false);
                    }}
                    className="relative cursor-pointer group bg-gray-100 border-2 border-gray-200 rounded hover:border-blue-500 transition-colors"
                  >
                    <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                      <img
                        src={img.url}
                        alt={img.name}
                        className="absolute top-0 left-0 w-full h-full object-cover rounded group-hover:opacity-80 transition-opacity"
                        loading="lazy"
                        style={{ backgroundColor: "#f3f4f6" }}
                        onError={(e) => {
                          console.error("Gallery image failed to load:", img.url);
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-xs rounded">
                                Failed to load
                              </div>
                            `;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-transparent group-hover:bg-black/30 transition-opacity flex items-center justify-center pointer-events-none rounded z-10">
                        <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center truncate w-full">
                          {img.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => setShowGallery(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


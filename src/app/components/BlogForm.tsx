"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const BlogEditor = dynamic(() => import("./BlogEditor"), {
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

export default function BlogForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    featuredImage: "",
    author: "Taypro Team",
    content: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

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
    } else if (isValidUrl(url)) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/blog/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Blog created successfully! Redirecting...");
        setFormData({
          title: "",
          description: "",
          featuredImage: "",
          author: "Taypro Team",
          content: "",
        });
        setImageError(false);
        setImageLoading(false);

        // ✅ FIXED: Ensure redirect URL is valid before navigating
        if (data.url) {
          setTimeout(() => {
            router.push(data.url);
          }, 500);
        } else if (data.id) {
          // ✅ Fallback: Build URL from ID if data.url is missing
          const redirectUrl = `/blog/db/${data.id}`;
          setTimeout(() => {
            router.push(redirectUrl);
          }, 500);
        } else {
          console.warn("⚠️ No URL or ID provided, redirecting to blog list");
          setTimeout(() => {
            router.push("/blog");
          }, 1000);
        }
      } else {
        throw new Error(data.error || "Failed to create blog");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setMessage(
        `Error creating blog: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#052638] p-6">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-[#052638]">
            Create New Blog
          </h1>
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
              Featured Image URL
            </label>
            <input
              type="text"
              value={formData.featuredImage}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                imageError && formData.featuredImage
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="https://res.cloudinary.com/your-image-url"
            />

            {formData.featuredImage && !isValidUrl(formData.featuredImage) && (
              <p className="mt-1 text-sm text-red-500">
                ⚠️ Invalid URL format. Must start with http:// or https://
              </p>
            )}

            {imageError && isValidUrl(formData.featuredImage) && (
              <p className="mt-1 text-sm text-red-500">
                ❌ Failed to load image. Check if the URL is accessible.
              </p>
            )}

            {formData.featuredImage &&
              isValidUrl(formData.featuredImage) &&
              !imageError && (
                <div className="mt-4 relative">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
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
                    />
                  </div>
                </div>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <div className="bg-white border border-gray-300 rounded-md p-2">
              <BlogEditor
                onContentChange={(content) =>
                  setFormData({ ...formData, content })
                }
                initialContent={formData.content}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.title ||
                !formData.description ||
                !formData.content ||
                (!!formData.featuredImage &&
                  (imageError || !isValidUrl(formData.featuredImage)))
              }
              className="w-full flex items-center justify-center bg-[#A8C117] hover:bg-lime-500 text-white py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Blog...
                </div>
              ) : (
                "Create Blog"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

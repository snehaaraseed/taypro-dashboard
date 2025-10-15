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

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, featuredImage: url });
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
        setMessage("Blog created successfully!");
        setFormData({
          title: "",
          description: "",
          featuredImage: "",
          author: "Taypro Team",
          content: "",
        });
        setImageError(false);
        router.push("/blog");
      } else {
        throw new Error(data.error || "Failed to create blog");
      }
    } catch (error) {
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
        <h1 className="text-3xl font-semibold text-[#052638] mb-8">
          Create New Blog
        </h1>

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
              type="url"
              value={formData.featuredImage}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                imageError
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="https://res.cloudinary.com/your-image-url"
            />
            {imageError && (
              <p className="mt-1 text-sm text-red-500">
                Please use an image from allowed domains (Cloudinary, Unsplash,
                etc.)
              </p>
            )}

            {formData.featuredImage && !imageError && (
              <div className="mt-2">
                <Image
                  src={formData.featuredImage}
                  alt="Featured image preview"
                  width={200}
                  height={120}
                  className="rounded-md object-cover border border-gray-300"
                  onError={() => setImageError(true)}
                />
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

          <button
            type="submit"
            disabled={
              isLoading ||
              !formData.title ||
              !formData.description ||
              !formData.content ||
              imageError
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
        </form>
      </div>
    </div>
  );
}

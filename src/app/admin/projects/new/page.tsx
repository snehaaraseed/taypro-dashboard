"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const BlogEditor = dynamic(() => import("../../../components/BlogEditor"), {
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

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    details: [] as string[],
    date: new Date().toISOString().split("T")[0],
    content: "",
  });
  const [detailInput, setDetailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<
    Array<{ url: string; name: string }>
  >([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

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
    setFormData((prev) => ({ ...prev, image: url }));

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
        setGalleryImages(data.images);
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

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage("Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage("File size exceeds 10MB limit. Please choose a smaller image.");
      return;
    }

    setUploadingImage(true);
    setMessage("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        setImageError(false);
        setMessage("✅ Image uploaded successfully!");
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage(
        `Error uploading image: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const addDetail = () => {
    if (detailInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        details: [...prev.details, detailInput.trim()],
      }));
      setDetailInput("");
    }
  };

  const removeDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/admin/projects`);
      } else {
        throw new Error(data.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Please try again."}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Create New Project
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

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project title"
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
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Image
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
              value={formData.image}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className={`w-full px-3 py-2 bg-white border rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                imageError && formData.image
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="https://res.cloudinary.com/your-image-url or /uploads/..."
            />

            {formData.image &&
              !formData.image.startsWith("/") &&
              !isValidUrl(formData.image) && (
                <p className="mt-1 text-sm text-red-500">
                  ⚠️ Invalid URL format. Must start with http://, https://, or /
                </p>
              )}

            {imageError &&
              (isValidUrl(formData.image) ||
                formData.image.startsWith("/")) && (
                <p className="mt-1 text-sm text-red-500">
                  ❌ Failed to load image. Check if the URL is accessible.
                </p>
              )}

            {/* Image Preview */}
            {formData.image &&
              (isValidUrl(formData.image) ||
                formData.image.startsWith("/")) &&
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
                      src={formData.image}
                      alt="Project image preview"
                      fill
                      className="object-cover"
                      onLoadingComplete={handleImageLoadSuccess}
                      onError={handleImageLoadError}
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: "" }));
                      setImageError(false);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                </div>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Details (e.g., "Automatic", "Capex", "Semi-Automatic")
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={detailInput}
                onChange={(e) => setDetailInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDetail();
                  }
                }}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter detail and press Enter"
              />
              <button
                type="button"
                onClick={addDetail}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.details.map((detail, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {detail}
                  <button
                    type="button"
                    onClick={() => removeDetail(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Content (Optional - Rich text editor for full project details)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Use the editor below to add detailed content about the project. This will be displayed below the overview section on the project page.
            </p>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <BlogEditor
                initialContent={formData.content}
                onContentChange={(html) =>
                  setFormData((prev) => ({ ...prev, content: html }))
                }
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.title ||
                !formData.description ||
                (!!formData.image &&
                  (imageError ||
                    (!isValidUrl(formData.image) &&
                      !formData.image.startsWith("/"))))
              }
              className="flex-1 flex items-center justify-center bg-[#A8C117] hover:bg-lime-500 text-white py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Creating Project...
                </div>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>

        {/* Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                Select Project Image from Gallery
              </h3>

              {loadingGallery ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600">Loading gallery...</span>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No images found in gallery.</p>
                  <p className="text-sm mt-2">
                    Upload images using the Upload button above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, image: img.url }));
                        setImageError(false);
                        setShowGallery(false);
                      }}
                      className="relative cursor-pointer group bg-gray-100 border-2 border-gray-200 rounded hover:border-blue-500 transition-colors"
                    >
                      <div
                        className="relative w-full"
                        style={{ paddingBottom: "100%" }}
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded group-hover:opacity-80 transition-opacity"
                          loading="lazy"
                          style={{ backgroundColor: "#f3f4f6" }}
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
    </div>
  );
}


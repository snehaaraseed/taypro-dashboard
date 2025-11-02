"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useState, useEffect } from "react";

interface BlogEditorProps {
  onContentChange: (content: string) => void;
  initialContent?: string;
}

export default function BlogEditor({
  onContentChange,
  initialContent = "",
}: BlogEditorProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "html">("visual");
  const [htmlContent, setHtmlContent] = useState("");
  const [imageModalTab, setImageModalTab] = useState<"upload" | "url" | "gallery">("url");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; name: string }>>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "blog-image max-w-full h-auto rounded-lg my-4",
        },
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-96 p-4",
      },
    },
  });

  // Update editor content when initialContent prop changes
  useEffect(() => {
    if (editor && initialContent !== undefined && initialContent !== null) {
      const currentContent = editor.getHTML();
      // Only update if content has actually changed to avoid unnecessary updates
      if (currentContent !== initialContent) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

  const addImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageModal(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload an image (JPEG, PNG, WebP, or GIF).");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please choose a smaller image.");
      return;
    }

    setSelectedFile(file);
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !editor) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
        setImageUrl("");
        setShowImageModal(false);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl("");
        }
        // Refresh gallery
        fetchGalleryImages();
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        `Error uploading image: ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const fetchGalleryImages = async () => {
    setLoadingGallery(true);
    try {
      const response = await fetch("/api/admin/upload/list");
      const data = await response.json();
      if (response.ok && data.images) {
        console.log("Gallery images received:", data.images.length);
        console.log("Sample image URLs:", data.images.slice(0, 3).map((img: { url: string }) => img.url));
        setGalleryImages(data.images);
      } else {
        console.error("Failed to fetch gallery images:", data);
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (showImageModal && imageModalTab === "gallery") {
      fetchGalleryImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImageModal, imageModalTab]);

  const addLink = () => {
    if (linkUrl && editor) {
      if (editor.state.selection.empty) {
        // Insert link with text
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${linkUrl}">${linkText || linkUrl}</a>`)
          .run();
      } else {
        // Wrap selected text in link
        editor
          .chain()
          .focus()
          .setLink({ href: linkUrl })
          .run();
      }
      setLinkUrl("");
      setLinkText("");
      setShowLinkModal(false);
    }
  };

  const removeLink = () => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
    }
  };

  const toggleViewMode = () => {
    if (editor) {
      if (viewMode === "visual") {
        // Switch to HTML view
        setHtmlContent(editor.getHTML());
        setViewMode("html");
      } else {
        // Switch back to visual view
        editor.commands.setContent(htmlContent);
        onContentChange(htmlContent);
        setViewMode("visual");
      }
    }
  };

  const handleHtmlChange = (html: string) => {
    setHtmlContent(html);
    if (editor) {
      editor.commands.setContent(html);
      onContentChange(html);
    }
  };

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        <div className="flex items-center justify-center h-96 bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <span className="ml-2 text-gray-600">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* WordPress-style Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300">
        {/* Primary Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bold")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Bold"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 110-2h2V5H2a1 1 0 010-2h2zm4 0a1 1 0 011 1v2a1 1 0 01-2 0V5a1 1 0 011-1zm2 0a4 4 0 014 4v2a4 4 0 01-4 4H9a1 1 0 01-1-1V4a1 1 0 011-1h1zm2 5a2 2 0 100 4h1a1 1 0 001-1v-2a1 1 0 00-1-1h-1z"
                  clipRule="evenodd"
                />
              </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("italic")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Italic"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a1 1 0 011-1h6a1 1 0 110 2h-3l-2 8h3a1 1 0 110 2H9a1 1 0 01-1-1V4z"
                  clipRule="evenodd"
                />
              </svg>
        </button>
        <button
          type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive("strike")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Strikethrough"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm2 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
        </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <select
              onChange={(e) => {
                const level = parseInt(e.target.value);
                if (level === 0) {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor.chain().focus().toggleHeading({ level: level as 2 | 3 | 4 }).run();
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={
                editor.isActive("heading", { level: 2 })
                  ? "2"
                  : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : editor.isActive("heading", { level: 4 })
                  ? "4"
                  : "0"
              }
            >
              <option value="0">Paragraph</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
            </select>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("bulletList")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Bullet List"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("orderedList")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Numbered List"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: "left" })
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Align Left"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: "center" })
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Align Center"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM7 15a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive({ textAlign: "right" })
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Align Right"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM7 10a1 1 0 011-1h10a1 1 0 110 2H8a1 1 0 01-1-1zM9 15a1 1 0 011-1h6a1 1 0 110 2h-6a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
            {editor.isActive("link") ? (
              <button
                type="button"
                onClick={removeLink}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-red-600"
                title="Remove Link"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="Insert Link"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                    clipRule="evenodd"
                  />
                </svg>
        </button>
            )}
          </div>

          {/* Quote & Code */}
          <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive("blockquote")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Quote"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
        </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive("code")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700"
              }`}
              title="Code"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Image */}
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Insert Image"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* View Toggle - WordPress Style */}
          <div className="ml-auto flex items-center gap-1 border-l border-gray-300 pl-2">
            <button
              type="button"
              onClick={toggleViewMode}
              className="px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors text-gray-700 border border-gray-300"
            >
              {viewMode === "visual" ? "HTML" : "Visual"}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      {viewMode === "visual" ? (
        <div className="bg-white">
        <EditorContent
          editor={editor}
            className="prose prose-lg max-w-none min-h-96 p-4
             prose-headings:text-[#052638]
             prose-headings:font-semibold
            prose-p:text-gray-700
            prose-p:leading-relaxed
             prose-a:text-blue-600
             prose-a:hover:text-blue-800
            prose-strong:text-[#052638]
             prose-ul:text-gray-700
             prose-ol:text-gray-700
            prose-li:text-gray-700
            prose-blockquote:border-l-4
            prose-blockquote:border-blue-500
            prose-blockquote:pl-4
            prose-blockquote:italic
             prose-code:bg-gray-100
             prose-code:px-2
             prose-code:py-1
             prose-code:rounded
             focus:outline-none"
          />
        </div>
      ) : (
        <div className="bg-white p-4">
          <textarea
            value={htmlContent || editor.getHTML()}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="w-full h-96 p-3 font-mono text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter HTML content..."
          />
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text (optional)
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Click here"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkUrl("");
                    setLinkText("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addLink}
                  className="px-4 py-2 bg-[#A8C117] text-white rounded hover:bg-lime-500 transition-colors"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b">
              <button
                type="button"
                onClick={() => setImageModalTab("upload")}
                className={`px-4 py-2 font-medium transition-colors ${
                  imageModalTab === "upload"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab("url")}
                className={`px-4 py-2 font-medium transition-colors ${
                  imageModalTab === "url"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab("gallery")}
                className={`px-4 py-2 font-medium transition-colors ${
                  imageModalTab === "gallery"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Gallery
              </button>
            </div>

            {/* Upload Tab */}
            {imageModalTab === "upload" && (
              <div className="space-y-4">
                <div>
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
                    Choose Image to Upload
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleFileSelect}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview */}
                {previewUrl && selectedFile && (
                  <div className="space-y-4">
                    <div className="relative w-full h-64 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>File:</strong> {selectedFile.name}</p>
                      <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}

                {uploadingImage && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3 text-gray-600">Uploading image...</span>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageModal(false);
                      setSelectedFile(null);
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl("");
                      }
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={!selectedFile || uploadingImage}
                    className="px-4 py-2 bg-[#A8C117] text-white rounded hover:bg-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingImage ? "Uploading..." : "Upload & Insert"}
                  </button>
                </div>
              </div>
            )}

            {/* URL Tab */}
            {imageModalTab === "url" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg or /uploads/..."
                  />
                </div>
                {imageUrl && (
                  <div className="relative w-full h-48 border border-gray-300 rounded overflow-hidden bg-gray-100">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
        />
      </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageModal(false);
                      setImageUrl("");
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addImage}
                    disabled={!imageUrl}
                    className="px-4 py-2 bg-[#A8C117] text-white rounded hover:bg-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Insert Image
                  </button>
                </div>
              </div>
            )}

            {/* Gallery Tab */}
            {imageModalTab === "gallery" && (
              <div className="space-y-4">
                {loadingGallery ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3 text-gray-600">Loading gallery...</span>
                  </div>
                ) : galleryImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No images found in gallery.</p>
                    <p className="text-sm mt-2">Upload images using the Upload tab.</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto p-2">
                    <div className="grid grid-cols-4 gap-3">
                      {galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (editor) {
                              editor.chain().focus().setImage({ src: img.url }).run();
                              setShowImageModal(false);
                              setImageUrl("");
                            }
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
                                console.error("Image failed to load:", img.url);
                                const target = e.target as HTMLImageElement;
                                target.style.backgroundColor = "#e5e7eb";
                                target.alt = `Failed to load: ${img.name}`;
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
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageModal(false);
                      setImageUrl("");
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

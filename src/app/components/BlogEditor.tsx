"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useState } from "react";

interface BlogEditorProps {
  onContentChange: (content: string) => void;
  initialContent?: string;
}

export default function BlogEditor({
  onContentChange,
  initialContent = "",
}: BlogEditorProps) {
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable all default heading levels
        heading: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "blog-image",
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["paragraph"],
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  const addImage = () => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
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
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar - Removed all heading buttons */}
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded transition-colors ${
            editor.isActive("bold")
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded transition-colors ${
            editor.isActive("italic")
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Italic
        </button>

        {/* Strong emphasis button (alternative to headings for important text) */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 rounded transition-colors ${
            editor.isActive("strike")
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Strikethrough
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 rounded transition-colors ${
            editor.isActive("bulletList")
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Bullet List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 rounded transition-colors ${
            editor.isActive("orderedList")
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Numbered List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1 rounded transition-colors ${
            editor.isActive("blockquote")
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Quote
        </button>

        {/* Image insertion */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addImage}
            className="px-3 py-1 bg-[#A8C117] text-white rounded text-sm hover:bg-lime-500 transition-colors cursor-pointer"
          >
            Add Image
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 min-h-96">
        <EditorContent
          editor={editor}
          className="
            prose
            max-w-none
            focus:outline-none
            min-h-80
            prose-p:text-gray-700
            prose-p:leading-relaxed
            prose-strong:text-[#052638]
            prose-strong:font-semibold
            prose-ul:list-disc
            prose-ul:pl-6
            prose-ol:list-decimal
            prose-ol:pl-6
            prose-li:text-gray-700
            prose-blockquote:border-l-4
            prose-blockquote:border-blue-500
            prose-blockquote:pl-4
            prose-blockquote:italic
          "
        />
      </div>
    </div>
  );
}

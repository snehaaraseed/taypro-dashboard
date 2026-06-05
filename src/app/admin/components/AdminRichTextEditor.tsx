"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

type AdminRichTextEditorProps = {
  onContentChange: (content: string) => void;
  initialContent?: string;
};

function EditorLoadingShell() {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-600">Loading editor…</p>
        <p className="text-xs text-gray-400 max-w-xs text-center">
          First load can take a few seconds while TipTap compiles.
        </p>
      </div>
    </div>
  );
}

const BlogEditor = dynamic(() => import("@/app/components/BlogEditor"), {
  ssr: false,
  loading: EditorLoadingShell,
});

class EditorErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-200 rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-800 font-medium mb-2">
            Rich text editor failed to load
          </p>
          <p className="text-sm text-red-600 mb-4">
            Try reloading the page. If this keeps happening, restart{" "}
            <code className="text-xs bg-red-100 px-1 rounded">npm run dev</code>.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AdminRichTextEditor(props: AdminRichTextEditorProps) {
  return (
    <EditorErrorBoundary>
      <BlogEditor {...props} />
    </EditorErrorBoundary>
  );
}

"use client";

import dynamic from "next/dynamic";
import { Breadcrumbs } from "../../components/Breadcrumbs";

// Dynamically import BlogForm with no SSR
const BlogForm = dynamic(() => import("../../components/BlogForm"), {
  ssr: false,
  loading: () => (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <span className="ml-4 text-gray-600">Loading form...</span>
      </div>
    </div>
  ),
});

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Add Blog", href: "" },
];

export default function AddBlogPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <BlogForm />
    </>
  );
}

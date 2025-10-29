import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import type { Metadata } from "next";

interface PageParams {
  id: string;
}

interface BlogPostProps {
  params: Promise<PageParams>;
}

interface BlogData {
  _id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  featuredImage: string;
  slug: string;
  publishDate: string;
  createdAt: string;
}

// Fetch blog data
async function getBlogData(id: string): Promise<BlogData | null> {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://console.taypro.in";
    const response = await fetch(`${backendUrl}/api/v1/blogposts/id/${id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlogData(id);

  if (!blog) {
    return {
      title: "Blog Post Not Found - Taypro",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${blog.title} - Taypro Blog`,
    description: blog.description,
    keywords:
      "solar panel cleaning, maintenance, taypro, solar energy, cleaning robots",
    openGraph: {
      title: `${blog.title} - Taypro Blog`,
      description: blog.description,
      url: `https://yourdomain.com/blog/db/${id}`,
      type: "article",
      images: blog.featuredImage ? [blog.featuredImage] : [],
    },
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { id } = await params;
  const blog = await getBlogData(id);

  if (!blog) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: blog.title, href: "" },
  ];

  const publishDate = new Date(blog.publishDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section with Featured Image */}
      <section className="w-full pt-20 pb-10 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {blog.featuredImage && (
            <div className="relative w-full h-96 mb-8 overflow-hidden">
              <Image
                src={blog.featuredImage}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#052638] mb-4 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-6">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {publishDate}
              </span>

              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                {blog.author}
              </span>
            </div>

            <h2 className="text-lg text-gray-700 leading-relaxed">
              {blog.description}
            </h2>
          </header>
        </div>
      </section>

      {/* Main Content */}
      <article className="w-full pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="prose prose-lg max-w-none space-y-5
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
             prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Back to Blog Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
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
              Back to All Blogs
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

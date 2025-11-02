import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { BlogImage } from "../../components/BlogImage";
import { BlogContent } from "../../components/BlogContent";
import { ArticleSchema } from "../../components/StructuredData";
import { SimilarBlogs } from "../../components/SimilarBlogs";
import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import { DynamicBlog } from "../../api/blog/list/route";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

interface PageParams {
  slug: string;
}

interface BlogPostProps {
  params: Promise<PageParams>;
}

interface BlogData {
  _id?: string;
  title: string;
  description: string;
  content: string;
  author: string;
  featuredImage: string;
  slug: string;
  publishDate: string;
  source?: "file";
}

// Fetch all blogs for similar blogs section
async function getAllBlogs(): Promise<DynamicBlog[]> {
  try {
    // Only fetch from file system now
    const fileBlogs = await getFileBlogs();

    const allBlogs = fileBlogs.sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

    return allBlogs;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

async function getFileBlogs(): Promise<DynamicBlog[]> {
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog");
    const entries = await fs.readdir(blogDir, { withFileTypes: true });

    const blogDirs = entries.filter(
      (entry) =>
        entry.isDirectory() &&
        !["components", "api", "[slug]", "add", "db"].includes(entry.name)
    );

    const blogs: DynamicBlog[] = [];

    for (const dir of blogDirs) {
      try {
        const metadataPath = path.join(blogDir, dir.name, "metadata.json");
        const metadataContent = await fs.readFile(metadataPath, "utf-8");
        const metadata = JSON.parse(metadataContent);

        if (metadata.published === false) {
          continue;
        }

        blogs.push({
          ...metadata,
          href: `/blog/${dir.name}`,
          source: "file",
        });
      } catch (error) {
        console.warn(`No metadata found for blog: ${dir.name}`);
      }
    }

    return blogs;
  } catch (error) {
    console.error("Error fetching file blogs:", error);
    return [];
  }
}

// Fetch blog data from file system only (database blogs have been migrated)
async function getBlogData(slug: string): Promise<BlogData | null> {
  // Fetch from file system
  try {
    const blogDir = path.join(process.cwd(), "src", "app", "blog", slug);
    const metadataPath = path.join(blogDir, "metadata.json");
    const contentPath = path.join(blogDir, "page.tsx");

    // ✅ Check if metadata file exists before trying to read
    try {
      await fs.access(metadataPath);
    } catch (error) {
      console.log("❌ Blog not found in file system either:", error);
      return null;
    }

    const [metadataContent, pageContent] = await Promise.all([
      fs.readFile(metadataPath, "utf-8"),
      fs.readFile(contentPath, "utf-8"),
    ]);

    const metadata = JSON.parse(metadataContent);

    // Check if blog is published (default to true for backward compatibility)
    if (metadata.published === false) {
      // Return null for drafts so they show 404
      return null;
    }

    // Extract content from page.tsx
    const contentMatch = pageContent.match(
      /<article[^>]*>([\s\S]*?)<\/article>/
    );
    const content = contentMatch ? contentMatch[1] : "";

    return {
      ...metadata,
      content,
      slug,
      source: "file",
    };
  } catch (error) {
    console.error("❌ Error fetching blog from file system:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogData(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found - Taypro",
      description: "The requested blog post could not be found.",
    };
  }

  const blogKeywords = blog.title.toLowerCase().includes("robot") || 
    blog.description.toLowerCase().includes("robot") 
    ? [
        "Solar Panel Cleaning Robot",
        "solar panel cleaning robot",
        "automatic solar panel cleaning robot",
        "solar panel cleaning",
        "solar panel maintenance",
        "solar energy",
        "cleaning robots",
        "taypro",
      ]
    : [
        "solar panel cleaning",
        "Solar Panel Cleaning Robot",
        "solar panel maintenance",
        "solar energy",
        "cleaning robots",
        "taypro",
      ];

  return {
    title: `${blog.title} | Taypro Blog - Solar Panel Cleaning Robot`,
    description: blog.description.includes("robot") 
      ? blog.description 
      : `${blog.description} Learn about Solar Panel Cleaning Robot technology and solutions.`,
    keywords: blogKeywords,
    openGraph: {
      title: `${blog.title} | Taypro Blog`,
      description: blog.description,
      url: `${siteUrl}/blog/${slug}`,
      type: "article",
      images: blog.featuredImage 
        ? [blog.featuredImage.startsWith("http") ? blog.featuredImage : `${siteUrl}${blog.featuredImage}`]
        : [`${siteUrl}/tayproasset/taypro-robotImage.png`],
      publishedTime: blog.publishDate,
      modifiedTime: blog.publishDate,
      authors: [blog.author || "Taypro Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${blog.title} | Taypro Blog`,
      description: blog.description,
      images: blog.featuredImage 
        ? [blog.featuredImage.startsWith("http") ? blog.featuredImage : `${siteUrl}${blog.featuredImage}`]
        : [`${siteUrl}/tayproasset/taypro-robotImage.png`],
    },
    alternates: {
      canonical: `${siteUrl}/blog/${slug}`,
    },
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const [blog, allBlogs] = await Promise.all([
    getBlogData(slug),
    getAllBlogs(),
  ]);

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
      <ArticleSchema
        headline={blog.title}
        description={blog.description}
        image={blog.featuredImage?.startsWith("http") ? blog.featuredImage : `${siteUrl}${blog.featuredImage || "/tayproasset/taypro-robotImage.png"}`}
        datePublished={blog.publishDate}
        dateModified={blog.publishDate}
        author={{
          name: blog.author || "Taypro Team",
          url: siteUrl,
        }}
        publisher={{
          name: "Taypro",
          logo: `${siteUrl}/tayproasset/taypro-logo.png`,
        }}
      />

      {/* Main Layout with Similar Blogs Sidebar */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content Column */}
            <div className="flex-1 lg:max-w-3xl">
              {/* Hero Section with Featured Image */}
              <section className="pb-10">
                {blog.featuredImage && (
                  <div className="relative w-full h-96 mb-8 overflow-hidden rounded-lg bg-gray-100">
                    <BlogImage
                      src={blog.featuredImage}
                      alt={`${blog.title} - Featured image for Solar Panel Cleaning Robot blog article by Taypro`}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 896px, 768px"
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
                        aria-hidden="true"
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
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {blog.author}
                    </span>

                    <span className="px-2 py-1 text-xs bg-gray-200 rounded">
                      📁 File
                    </span>
                  </div>

                  <h2 className="text-lg text-gray-700 leading-relaxed">
                    {blog.description}
                  </h2>
                </header>
              </section>

              {/* Main Content */}
              <article>
                <BlogContent
                  content={blog.content}
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
                      aria-hidden="true"
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
              </article>
            </div>

            {/* Similar Blogs Sidebar - Full Height */}
            <SimilarBlogs blogs={allBlogs} currentSlug={slug} />
          </div>
        </div>
      </div>
    </>
  );
}

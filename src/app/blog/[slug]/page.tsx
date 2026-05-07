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
import { addInternalLinks } from "../../utils/internalLinking";
import {
  getAuthorAvatarUrl,
  slugifyAuthorName,
} from "../../data/blogAuthors";
import { getStoredAuthors } from "../../utils/blogAuthorsStore";

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

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/&amp;/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function addHeadingIdsAndExtractToc(html: string): {
  contentWithIds: string;
  toc: TocItem[];
} {
  if (!html) {
    return { contentWithIds: html, toc: [] };
  }

  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  const contentWithIds = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelStr, attrs, innerHtml) => {
      const plainText = innerHtml
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

      if (!plainText) return match;

      const level = Number(levelStr) as 2 | 3;
      let id = slugifyHeading(plainText) || `section-${toc.length + 1}`;
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${id}-${suffix}`;
        suffix += 1;
      }
      usedIds.add(id);

      toc.push({ id, text: plainText, level });

      if (/id\s*=\s*["'][^"']+["']/i.test(attrs)) {
        return `<h${level}${attrs}>${innerHtml}</h${level}>`;
      }

      return `<h${level}${attrs} id="${id}">${innerHtml}</h${level}>`;
    }
  );

  return { contentWithIds, toc };
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
    const contentHtmlPath = path.join(blogDir, "content.html");
    const contentPath = path.join(blogDir, "page.tsx");

    // ✅ Check if metadata file exists before trying to read
    try {
      await fs.access(metadataPath);
    } catch (error) {
      console.log("❌ Blog not found in file system either:", error);
      return null;
    }

    const metadataContent = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(metadataContent);

    // Check if blog is published (default to true for backward compatibility)
    if (metadata.published === false) {
      // Return null for drafts so they show 404
      return null;
    }

    // Try to read from content.html first (clean extracted content)
    let content = "";
    try {
      content = await fs.readFile(contentHtmlPath, "utf-8");
    } catch (error) {
      // Fallback: extract from page.tsx if it exists
      try {
        const pageContent = await fs.readFile(contentPath, "utf-8");
        
        // Extract HTML from known page patterns used in this codebase.
        const patterns = [
          /content=\{\s*`([\s\S]*?)`\s*\}/,                      // BlogContent content={`...`}
          /content=\{\\?`([\s\S]*?)\\?`\}/,                      // Escaped template variant
          /__html:\s*`([\s\S]*?)\\\\?`\s*,\s*\}\s*\}\s*\/>/,  // With comma
          /__html:\s*`([\s\S]*?)\\\\?`\s*\}\s*\}\s*\/>/,     // Without comma
        ];
        
        let found = false;
        for (const pattern of patterns) {
          const match = pageContent.match(pattern);
          if (match && match[1]) {
            content = match[1];
            content = content
              .replace(/\\n/g, "\n")
              .replace(/\\`/g, "`")
              .replace(/\\\$/g, "$")
              .replace(/\\\\/g, "\\");
            found = true;
            break;
          }
        }
        
        // If no match, try finding between __html: ` and \`, before }} />
        if (!found) {
          const startPattern = /__html:\s*`/;
          const endPattern = /\\\`,\s*\}\s*\}\s*\/>/;
          const startMatch = pageContent.match(startPattern);
          const endMatch = pageContent.match(endPattern);
          
          if (startMatch && endMatch && startMatch.index !== undefined && endMatch.index !== undefined) {
            const startPos = startMatch.index + startMatch[0].length;
            const endPos = endMatch.index;
            content = pageContent.substring(startPos, endPos);
            content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$').replace(/\\\\/g, '\\');
          }
        }
      } catch (pageError) {
        // No page.tsx or content.html, content will be empty
        content = "";
      }
    }

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

// Generate static params for all blog pages at build time
export async function generateStaticParams(): Promise<PageParams[]> {
  const blogs = await getFileBlogs();
  
  // Only generate static params for published blogs
  // Note: getFileBlogs already filters out unpublished blogs, but we check again for safety
  return blogs
    .filter((blog) => (blog as DynamicBlog & { published?: boolean }).published !== false)
    .map((blog) => ({
      slug: blog.slug,
    }));
}

// Enable ISR: regenerate pages every hour, but allow stale-while-revalidate
export const revalidate = 3600; // 1 hour in seconds

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
  const readingMinutes = Math.max(
    1,
    Math.ceil(blog.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 220)
  );

  const { contentWithIds, toc } = addHeadingIdsAndExtractToc(
    addInternalLinks(blog.content, allBlogs, slug, 8)
  );
  const authorSlug = slugifyAuthorName(blog.author || "Taypro Team");
  const authors = await getStoredAuthors();
  const knownAuthor = authors.find(
    (author) => author.name.toLowerCase() === (blog.author || "Taypro Team").toLowerCase()
  );
  const authorAvatarUrl = knownAuthor?.avatarUrl || getAuthorAvatarUrl(blog.author || "Taypro Team");
  const moreFromAuthor = allBlogs
    .filter((post) => post.slug !== slug && post.author === blog.author)
    .slice(0, 3);

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

      {/* Main Layout with TOC + Main Content + Right Sidebar */}
      <div className="w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-0 pb-20">
          {/* Ahrefs-style Top Article Header */}
          <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#052638] border-y border-[#0c3c57] mb-10">
            <header className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-10">
              <p className="text-sm font-medium text-[#A8C117] mb-3">Blog</p>
              <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200 mb-5">
                <img
                  src={authorAvatarUrl}
                  alt={blog.author}
                  className="w-9 h-9 rounded-full border border-slate-500 object-cover"
                />
                <span className="font-medium text-white">
                  By{" "}
                  <Link
                    href={`/blog/author/${authorSlug}`}
                    className="underline decoration-slate-300/60 underline-offset-2 hover:text-[#A8C117] transition-colors"
                  >
                    {blog.author}
                  </Link>
                  {knownAuthor?.role ? (
                    <span className="ml-2 font-normal text-slate-300">
                      ({knownAuthor.role})
                    </span>
                  ) : null}
                </span>
                <span aria-hidden="true">|</span>
                <span>{publishDate}</span>
                <span aria-hidden="true">|</span>
                <span>{readingMinutes} min read</span>
              </div>
              <p className="text-lg text-slate-100 leading-relaxed">{blog.description}</p>
            </header>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-10">
            {/* Left TOC */}
            <aside className="hidden xl:block">
              {toc.length > 0 && (
                <div className="sticky top-24 border border-gray-200 rounded-xl p-5 bg-white">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[#052638] mb-4">
                    Contents
                  </h3>
                  <nav aria-label="Table of contents">
                    <ul className="space-y-2">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className={`block text-sm leading-snug hover:text-blue-700 transition-colors ${
                              item.level === 3
                                ? "text-gray-600 pl-4"
                                : "text-[#052638] font-medium"
                            }`}
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </aside>

            {/* Main Content Column */}
            <div className="min-w-0">
              {/* Hero Section with Featured Image */}
              <section className="pb-8">
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
              </section>

              {/* Main Content */}
              <article suppressHydrationWarning>
                <BlogContent
                  content={contentWithIds}
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

              {moreFromAuthor.length > 0 && (
                <section className="mt-12 border-t border-gray-200 pt-10">
                  <h3 className="text-2xl font-semibold text-[#052638] mb-6">
                    More from this author
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {moreFromAuthor.map((post) => (
                      <Link
                        key={post.slug}
                        href={post.href}
                        className="block rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="relative w-full h-40 bg-gray-100">
                          {post.featuredImage ? (
                            <BlogImage
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 33vw"
                            />
                          ) : null}
                        </div>
                        <div className="p-4">
                          <h4 className="text-base font-semibold text-[#052638] line-clamp-2 mb-2">
                            {post.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {post.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Sidebar */}
            <aside className="xl:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-[#052638] to-[#0c3c57] p-6 text-white">
                  <p className="text-xs uppercase tracking-wider text-[#A8C117] mb-2">
                    Product
                  </p>
                  <h3 className="text-2xl font-semibold leading-tight mb-3">
                    Discover Taypro Solar Cleaning Robot
                  </h3>
                  <p className="text-sm text-slate-100 mb-5">
                    Reduce manual effort, improve panel performance, and automate maintenance with Taypro.
                  </p>
                  <Link
                    href="/solar-panel-cleaning-system"
                    className="inline-flex items-center justify-center rounded-md bg-[#A8C117] px-4 py-2 text-sm font-semibold text-[#052638] hover:bg-[#bfd63a] transition-colors"
                  >
                    Explore Product
                  </Link>
                </div>

                <div className="rounded-xl border border-gray-200 p-6 bg-white">
                  <h3 className="text-xl font-semibold text-[#052638] mb-2">
                    Subscribe Newsletter
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get the latest blog updates and solar cleaning insights in your inbox.
                  </p>
                  <form className="space-y-3">
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c3c57]"
                    />
                    <button
                      type="button"
                      className="w-full rounded-md bg-[#052638] px-4 py-2 text-sm font-medium text-white hover:bg-[#0c3c57] transition-colors"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </aside>
          </div>

          {/* Similar Blogs Bottom Section */}
          <div className="mt-16">
            <SimilarBlogs blogs={allBlogs} currentSlug={slug} layout="bottom" />
          </div>
        </div>
      </div>
    </>
  );
}

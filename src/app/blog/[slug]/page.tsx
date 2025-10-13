import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { energyResourceCards } from "../../data";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import type { Metadata } from "next";
import {
  EnergyResourceCard,
  extractSlugFromHref,
  findBlogBySlug,
} from "@/app/utils/extractSlug";
import { scrapeBlogContent, ScrapedBlogContent } from "@/app/lib/blogScraper";

// Type for the params
interface PageParams {
  slug: string;
}

interface BlogPostProps {
  params: PageParams;
}

// Generate static params for all blog posts
export async function generateStaticParams(): Promise<PageParams[]> {
  return energyResourceCards.map((blog: EnergyResourceCard) => ({
    slug: extractSlugFromHref(blog.href),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const blogMeta = findBlogBySlug(slug, energyResourceCards);

  if (!blogMeta) {
    return {
      title: "Blog Post Not Found - Taypro",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${blogMeta.title} - Taypro Blog`,
    description: `Read about ${blogMeta.title} on Taypro's official blog. Expert insights on solar panel cleaning and maintenance.`,
    keywords:
      "solar panel cleaning, maintenance, taypro, solar energy, cleaning robots",
    openGraph: {
      title: `${blogMeta.title} - Taypro Blog`,
      description: `Read about ${blogMeta.title} on Taypro's official blog.`,
      url: `https://yourdomain.com/blog/${slug}`,
      type: "article",
      images: blogMeta.imgSrc
        ? [`https://yourdomain.com${blogMeta.imgSrc}`]
        : [],
    },
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;

  // Find the blog in our data
  const blogMeta: EnergyResourceCard | undefined = findBlogBySlug(
    slug,
    energyResourceCards
  );

  if (!blogMeta) {
    notFound();
  }

  // Scrape content from the corresponding Taypro URL
  const tayproUrl = `https://taypro.in${blogMeta.href}`;
  const scrapedContent: ScrapedBlogContent = await scrapeBlogContent(tayproUrl);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: scrapedContent.title, href: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section with Featured Image */}
      <section className="w-full pt-20 pb-10 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Featured Image */}
          {(blogMeta.imgSrc || scrapedContent.featuredImage) && (
            <div className="relative w-full h-96 mb-8 overflow-hidden">
              <Image
                src={scrapedContent.featuredImage || blogMeta.imgSrc}
                alt={scrapedContent.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold text-[#052638] mb-4 leading-tight">
              {scrapedContent.title}
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
                {scrapedContent.publishDate || blogMeta.date}
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
                {scrapedContent.author}
              </span>

              <Link
                href={tayproUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View Original
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                </svg>
              </Link>
            </div>

            {scrapedContent.description && (
              <p className="text-lg text-gray-700 leading-relaxed">
                {scrapedContent.description}
              </p>
            )}
          </header>
        </div>
      </section>

      {/* Main Content */}
      <article className="w-full pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="prose prose-lg max-w-none space-y-20
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
            dangerouslySetInnerHTML={{ __html: scrapedContent.content }}
          />

          {/* Related Posts Section */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-semibold text-[#052638] mb-6">
              Related Articles
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {energyResourceCards
                .filter(
                  (blog: EnergyResourceCard) =>
                    extractSlugFromHref(blog.href) !== slug
                )
                .slice(0, 2)
                .map((relatedBlog: EnergyResourceCard, idx: number) => (
                  <Link
                    href={`/blog/${extractSlugFromHref(relatedBlog.href)}`}
                    key={idx}
                    className="block border border-gray-300 p-4 rounded-lg hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative w-full h-48 mb-4 overflow-hidden rounded">
                      <Image
                        src={relatedBlog.imgSrc}
                        alt={relatedBlog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="font-semibold text-[#052638] mb-2 group-hover:text-blue-600 transition-colors">
                      {relatedBlog.title}
                    </h4>
                    <p className="text-sm text-gray-600">{relatedBlog.date}</p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { formatLocaleDate } from "@/i18n/format-date";
import { listAllBlogs } from "@/lib/cms/blogService";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { NewsletterSubscribeCard } from "@/app/components/NewsletterSubscribeCard";
import { ProfilePageSchema } from "@/app/components/StructuredData";
import {
  getAuthorAvatarUrl,
  resolveAuthorSlug,
} from "@/app/data/blogAuthors";
import { getStoredAuthors } from "@/app/utils/blogAuthorsStore";
import { getBlogFeaturedImageAlt } from "@/app/utils/imageAlt";
import { withHreflang } from "@/lib/seo/with-hreflang";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

interface AuthorSlugParams {
  authorSlug: string;
}

interface AuthorPageProps {
  params: Promise<{ locale: string; authorSlug: string }>;
}

interface AuthorBlog {
  title: string;
  description: string;
  featuredImage: string;
  featuredImageAlt?: string;
  slug: string;
  publishDate: string;
  updatedAt?: string;
  author: string;
}

async function getAllPublishedBlogs(): Promise<AuthorBlog[]> {
  const rows = await listAllBlogs(false);
  return rows.map((metadata) => ({
    title: metadata.title,
    description: metadata.description,
    featuredImage: metadata.featuredImage,
    featuredImageAlt: metadata.featuredImageAlt,
    slug: metadata.slug,
    publishDate: metadata.publishDate,
    updatedAt: metadata.updatedAt,
    author: metadata.author || "Taypro Team",
  }));
}

export async function generateStaticParams(): Promise<AuthorSlugParams[]> {
  const blogs = await getAllPublishedBlogs();
  const storedAuthors = await getStoredAuthors();
  const slugs = new Set<string>(storedAuthors.map((author) => author.slug));
  for (const blog of blogs) {
    slugs.add(resolveAuthorSlug(blog.author, storedAuthors));
  }
  return [...slugs].map((authorSlug) => ({ authorSlug }));
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { authorSlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage.author" });
  const [allBlogs, storedAuthors] = await Promise.all([
    getAllPublishedBlogs(),
    getStoredAuthors(),
  ]);
  const authorBlogs = allBlogs.filter(
    (blog) => resolveAuthorSlug(blog.author, storedAuthors) === authorSlug
  );
  const knownAuthor = storedAuthors.find((author) => author.slug === authorSlug);

  if (authorBlogs.length === 0 && !knownAuthor) {
    return {
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
      robots: { index: false, follow: false },
    };
  }

  const authorName = knownAuthor?.name || authorBlogs[0]?.author || authorSlug;
  const authorRole = knownAuthor?.role || t("defaultRole");
  const bio = knownAuthor?.bio?.trim();
  const articlesLabel =
    authorBlogs.length === 1 ? t("article") : t("articles");
  const fallbackDescription = t("fallbackDescription", {
    role: authorRole,
    count: authorBlogs.length,
    articlesLabel,
  });
  const description = bio && bio.length > 40 ? bio : fallbackDescription;

  const rawAvatar = knownAuthor?.avatarUrl || getAuthorAvatarUrl(authorName);
  const ogImage = rawAvatar.startsWith("http")
    ? rawAvatar
    : `${siteUrl}${rawAvatar.startsWith("/") ? "" : "/"}${rawAvatar}`;
  const canonical = `${siteUrl}/blog/author/${authorSlug}`;

  return withHreflang(`/blog/author/${authorSlug}`, locale, {
    title: t("metaTitle", { name: authorName }),
    description,
    openGraph: {
      title: t("metaOgTitle", { name: authorName }),
      description,
      url: canonical,
      type: "profile",
      images: [
        {
          url: ogImage,
          alt: `${authorName} - Taypro`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: t("metaTwitterTitle", { name: authorName }),
      description,
      images: [ogImage],
    },
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { authorSlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "BlogPage.author" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });

  const allBlogs = await getAllPublishedBlogs();
  const authors = await getStoredAuthors();
  const knownAuthor = authors.find((author) => author.slug === authorSlug);
  const authorBlogs = allBlogs.filter(
    (blog) => resolveAuthorSlug(blog.author, authors) === authorSlug
  );

  if (authorBlogs.length === 0 && !knownAuthor) {
    notFound();
  }

  const authorName = knownAuthor?.name || authorBlogs[0]?.author || authorSlug;
  const authorRole = knownAuthor?.role || t("defaultRole");
  const authorBio = knownAuthor?.bio || t("fallbackBio");
  const authorAvatar = knownAuthor?.avatarUrl || getAuthorAvatarUrl(authorName);

  // SEO: ProfilePage/Person JSON-LD. Mirrors the description used in
  // generateMetadata so head + body schema stay consistent.
  const bioTrimmed = knownAuthor?.bio?.trim();
  const articlesLabel =
    authorBlogs.length === 1 ? t("article") : t("articles");
  const schemaDescription =
    bioTrimmed && bioTrimmed.length > 40
      ? bioTrimmed
      : t("fallbackDescription", {
          role: authorRole,
          count: authorBlogs.length,
          articlesLabel,
        });
  const profileImage = authorAvatar.startsWith("http")
    ? authorAvatar
    : `${siteUrl}${authorAvatar.startsWith("/") ? "" : "/"}${authorAvatar}`;
  const profileUrl = `${siteUrl}/blog/author/${authorSlug}`;
  const profileSameAs = knownAuthor?.linkedInUrl
    ? [knownAuthor.linkedInUrl]
    : undefined;

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbBlog"), href: "/blog" },
    { name: t("breadcrumbAuthors"), href: "/authors" },
    { name: authorName, href: "" },
  ];

  return (
    <>
      <ProfilePageSchema
        url={profileUrl}
        name={authorName}
        description={schemaDescription}
        role={authorRole}
        image={profileImage}
        sameAs={profileSameAs}
        postCount={authorBlogs.length}
      />
      <Breadcrumbs items={breadcrumbs} />

      <section className="w-full bg-[#052638] border-b border-[#0c3c57]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Image
            src={authorAvatar}
            alt={authorName}
            width={80}
            height={80}
            sizes="80px"
            className="w-20 h-20 rounded-full border border-slate-500 object-cover mb-4"
          />
          <p className="text-sm text-[#A8C117] font-medium mb-2">
            {t("labelAuthor")}
          </p>
          <h1 className="text-4xl font-semibold text-white mb-3">{authorName}</h1>
          <p className="text-slate-200 mb-2">{authorRole}</p>
          <p className="text-slate-100 max-w-3xl mb-4">{authorBio}</p>
          {knownAuthor?.linkedInUrl ? (
            <a
              href={knownAuthor.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#0A66C2] hover:bg-[#095196] text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              <svg
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {t("linkedinCta")}
            </a>
          ) : null}
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold text-[#052638] mb-8">
            {t("articlesHeading", { name: authorName })}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorBlogs.map((blog) => (
              <Link
                href={`/blog/${blog.slug}`}
                key={blog.slug}
                className="group block border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-52 bg-gray-100">
                  {blog.featuredImage ? (
                    <Image
                      src={blog.featuredImage}
                      alt={getBlogFeaturedImageAlt(blog)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {t("noImage")}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#052638] line-clamp-2 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {blog.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("lastUpdated", {
                      date: formatLocaleDate(
                        locale,
                        blog.updatedAt || blog.publishDate
                      ),
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="max-w-xl mx-auto mt-12">
            <NewsletterSubscribeCard />
          </div>
        </div>
      </section>
    </>
  );
}


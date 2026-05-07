import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { promises as fs } from "fs";
import path from "path";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import {
  getAuthorAvatarUrl,
  slugifyAuthorName,
} from "../../../data/blogAuthors";
import { getStoredAuthors } from "../../../utils/blogAuthorsStore";

interface AuthorPageParams {
  authorSlug: string;
}

interface AuthorPageProps {
  params: Promise<AuthorPageParams>;
}

interface AuthorBlog {
  title: string;
  description: string;
  featuredImage: string;
  slug: string;
  publishDate: string;
  author: string;
}

async function getAllPublishedBlogs(): Promise<AuthorBlog[]> {
  const blogDir = path.join(process.cwd(), "src", "app", "blog");
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  const blogDirs = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !["components", "api", "[slug]", "add", "db", "author"].includes(entry.name)
  );

  const blogs: AuthorBlog[] = [];
  for (const dir of blogDirs) {
    try {
      const metadataPath = path.join(blogDir, dir.name, "metadata.json");
      const metadataRaw = await fs.readFile(metadataPath, "utf-8");
      const metadata = JSON.parse(metadataRaw);
      if (metadata.published === false) continue;

      blogs.push({
        title: metadata.title,
        description: metadata.description,
        featuredImage: metadata.featuredImage,
        slug: dir.name,
        publishDate: metadata.publishDate,
        author: metadata.author || "Taypro Team",
      });
    } catch {
      // Skip invalid blog folders
    }
  }

  return blogs.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export async function generateStaticParams(): Promise<AuthorPageParams[]> {
  const blogs = await getAllPublishedBlogs();
  const storedAuthors = await getStoredAuthors();
  const slugs = new Set<string>(storedAuthors.map((author) => author.slug));
  for (const blog of blogs) {
    slugs.add(slugifyAuthorName(blog.author));
  }
  return [...slugs].map((authorSlug) => ({ authorSlug }));
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { authorSlug } = await params;
  const allBlogs = await getAllPublishedBlogs();
  const authors = await getStoredAuthors();
  const authorBlogs = allBlogs.filter(
    (blog) => slugifyAuthorName(blog.author) === authorSlug
  );

  if (authorBlogs.length === 0) {
    notFound();
  }

  const knownAuthor = authors.find((author) => author.slug === authorSlug);
  const authorName = knownAuthor?.name || authorBlogs[0].author;
  const authorRole = knownAuthor?.role || "Contributing Author";
  const authorBio =
    knownAuthor?.bio ||
    "Author profile generated from published blog posts.";
  const authorAvatar = knownAuthor?.avatarUrl || getAuthorAvatarUrl(authorName);

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Authors", href: "/authors" },
    { name: authorName, href: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <section className="w-full bg-[#052638] border-b border-[#0c3c57]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-20 h-20 rounded-full border border-slate-500 object-cover mb-4"
          />
          <p className="text-sm text-[#A8C117] font-medium mb-2">Author</p>
          <h1 className="text-4xl font-semibold text-white mb-3">{authorName}</h1>
          <p className="text-slate-200 mb-2">{authorRole}</p>
          <p className="text-slate-100 max-w-3xl">{authorBio}</p>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold text-[#052638] mb-8">
            Articles by {authorName}
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
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
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
                    {new Date(blog.publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}


import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { NewsletterSubscribeCard } from "../components/NewsletterSubscribeCard";
import {
  getAuthorAvatarUrl,
  slugifyAuthorName,
} from "../data/blogAuthors";
import { getStoredAuthors } from "../utils/blogAuthorsStore";

interface AuthorStats {
  name: string;
  slug: string;
  count: number;
}

async function getAuthorStats(): Promise<AuthorStats[]> {
  const storedAuthors = await getStoredAuthors();
  const blogDir = path.join(process.cwd(), "src", "app", "blog");
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  const blogDirs = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !["components", "api", "[slug]", "add", "db", "author"].includes(entry.name)
  );

  const counts = new Map<string, { name: string; count: number }>();

  for (const dir of blogDirs) {
    try {
      const metadataPath = path.join(blogDir, dir.name, "metadata.json");
      const metadataRaw = await fs.readFile(metadataPath, "utf-8");
      const metadata = JSON.parse(metadataRaw);
      if (metadata.published === false) continue;

      const authorName = metadata.author || "Taypro Team";
      const authorSlug = slugifyAuthorName(authorName);
      const existing = counts.get(authorSlug);
      counts.set(authorSlug, {
        name: authorName,
        count: (existing?.count || 0) + 1,
      });
    } catch {
      // Skip invalid metadata
    }
  }

  // Include configured authors even if they have no posts yet
  for (const author of storedAuthors) {
    if (!counts.has(author.slug)) {
      counts.set(author.slug, { name: author.name, count: 0 });
    }
  }

  return [...counts.entries()]
    .map(([slug, data]) => ({ slug, name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default async function AuthorsPage() {
  const authorStats = await getAuthorStats();
  const storedAuthors = await getStoredAuthors();

  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Authors", href: "" },
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <section className="w-full bg-[#052638] border-b border-[#0c3c57]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-sm text-[#A8C117] font-medium mb-2">Blog Directory</p>
          <h1 className="text-4xl font-semibold text-white mb-3">Authors</h1>
          <p className="text-slate-200 max-w-3xl">
            Explore all blog contributors and read their published articles.
          </p>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorStats.map((author) => {
              const knownAuthor = storedAuthors.find((item) => item.slug === author.slug);
              return (
                <Link
                  key={author.slug}
                  href={`/blog/author/${author.slug}`}
                  className="block rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <img
                    src={knownAuthor?.avatarUrl || getAuthorAvatarUrl(author.name)}
                    alt={author.name}
                    className="w-16 h-16 rounded-full border border-gray-200 object-cover mb-4"
                  />
                  <h2 className="text-xl font-semibold text-[#052638] mb-1">
                    {author.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">
                    {knownAuthor?.role || "Contributing Author"}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {knownAuthor?.bio ||
                      "Read this author's blog posts and insights."}
                  </p>
                  <p className="text-xs font-medium text-[#0c3c57]">
                    {author.count} {author.count === 1 ? "article" : "articles"}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="max-w-xl mx-auto mt-12">
            <NewsletterSubscribeCard />
          </div>
        </div>
      </section>
    </>
  );
}


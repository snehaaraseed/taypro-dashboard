import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { withHreflang } from "@/lib/seo/with-hreflang";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import { listAllBlogs } from "@/lib/cms/blogService";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { FaqSection } from "@/app/components/FaqSection";
import { NewsletterSubscribeCard } from "@/app/components/NewsletterSubscribeCard";
import { FAQPageSchema } from "@/app/components/StructuredData";
import {
  getAuthorAvatarUrl,
  resolveAuthorSlug,
} from "@/app/data/blogAuthors";
import { getStoredAuthors } from "@/app/utils/blogAuthorsStore";
import type { Metadata } from "next";

const AUTHORS_PATH = "/authors";
const siteUrl = SITE_URL;
const ogImage = `${siteUrl}/tayproasset/taypro-robotImage.png`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "AuthorsPage.meta",
  });

  const keywords = [
    t("keyword0"),
    t("keyword1"),
    t("keyword2"),
    t("keyword3"),
    t("keyword4"),
  ];

  return withHreflang(AUTHORS_PATH, locale, {
    title: t("title"),
    description: t("description"),
    keywords,
    openGraph: {
      title: t("openGraphTitle"),
      description: t("openGraphDescription"),
      url: `${siteUrl}${AUTHORS_PATH}`,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: t("openGraphImageAlt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: [ogImage],
    },
  });
}

interface AuthorStats {
  name: string;
  slug: string;
  count: number;
}

async function getAuthorStats(): Promise<AuthorStats[]> {
  const storedAuthors = await getStoredAuthors();
  const blogs = await listAllBlogs(false);
  const counts = new Map<string, { name: string; count: number }>();

  for (const author of storedAuthors) {
    counts.set(author.slug, { name: author.name, count: 0 });
  }

  for (const metadata of blogs) {
    const authorName = metadata.author || "Taypro Team";
    const authorSlug = resolveAuthorSlug(authorName, storedAuthors);
    const existing = counts.get(authorSlug);
    const stored = storedAuthors.find((a) => a.slug === authorSlug);
    counts.set(authorSlug, {
      name: stored?.name || existing?.name || authorName,
      count: (existing?.count || 0) + 1,
    });
  }

  return [...counts.entries()]
    .map(([slug, data]) => ({ slug, name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default async function AuthorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AuthorsPage" });
  const tCommon = await getTranslations({ locale, namespace: "Common" });
  const authorStats = await getAuthorStats();
  const storedAuthors = await getStoredAuthors();

  const authorFaqs = ["q0", "q1", "q2"].map((qKey, i) => ({
    question: t(`faq.${qKey}`),
    answer: t(`faq.a${i}`),
  }));

  const topicKeys = ["t0", "t1", "t2", "t3"] as const;

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbs.authors"), href: "" },
  ];

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />
      <FAQPageSchema faqs={authorFaqs} />
      <section className="w-full bg-[#052638] border-b border-[#0c3c57]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <p className="text-sm text-[#A8C117] font-medium mb-2">
            {t("hero.eyebrow")}
          </p>
          <h1 className="text-4xl font-semibold text-white mb-3">
            {t("hero.title")}
          </h1>
          <p className="text-slate-200 max-w-3xl mb-4">{t("hero.description")}</p>
          <div className="max-w-3xl space-y-4 text-slate-200 leading-relaxed">
            <p>{t("hero.introP1")}</p>
            <p>
              {t("hero.introP2Before")}{" "}
              <Link
                href="/blog"
                className="text-[#c5db4a] font-medium underline-offset-4 hover:underline"
              >
                {t("hero.introP2BlogLink")}
              </Link>{" "}
              {t("hero.introP2Middle")}{" "}
              <Link
                href="/solar-panel-cleaning-robot-price-calculator#calculator"
                className="text-[#c5db4a] font-medium underline-offset-4 hover:underline"
              >
                {t("hero.introP2CalculatorLink")}
              </Link>
              {t("hero.introP2After")}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#f4f7f9] py-10 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl mb-3">
            {t("topics.heading")}
          </h2>
          <p className="text-[#27415c] text-lg mb-6 max-w-3xl leading-relaxed">
            {t("topics.intro")}
          </p>
          <ul className="list-disc list-inside space-y-2 text-[#27415c] text-base md:text-lg max-w-3xl">
            {topicKeys.map((key) => (
              <li key={key}>{t(`topics.${key}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorStats.map((author) => {
              const knownAuthor = storedAuthors.find(
                (item) => item.slug === author.slug
              );
              return (
                <Link
                  key={author.slug}
                  href={`/blog/author/${author.slug}`}
                  className="block rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <img
                    src={
                      knownAuthor?.avatarUrl || getAuthorAvatarUrl(author.name)
                    }
                    alt={author.name}
                    className="w-16 h-16 rounded-full border border-gray-200 object-cover mb-4"
                  />
                  <h2 className="text-xl font-semibold text-[#052638] mb-1">
                    {author.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">
                    {knownAuthor?.role || t("defaultRole")}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {knownAuthor?.bio || t("defaultBio")}
                  </p>
                  <p className="text-xs font-medium text-[#0c3c57]">
                    {author.count}{" "}
                    {author.count === 1 ? t("article") : t("articles")}
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

      <FaqSection
        id="authors-faq-heading"
        title={t("faq.heading")}
        subtitle={t("faq.subheading")}
        faqs={authorFaqs}
        tone="muted"
      />
    </div>
  );
}

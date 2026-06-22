import { getLocale, getTranslations } from "next-intl/server";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import TrackedLink from "@/app/components/TrackedLink";
import { HomeBlogCard } from "@/app/[locale]/home/HomeBlogCard";
import { listAllBlogs } from "@/lib/cms/blogService";
import { getBlogFeaturedImageAlt } from "@/app/utils/imageAlt";

const DATE_LOCALE: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ar: "ar",
  ja: "ja-JP",
  bn: "bn-IN",
};

async function getLatestBlogs(limit = 3, locale: string) {
  const rows = await listAllBlogs(false, locale);
  const dateLocale = DATE_LOCALE[locale] ?? "en-IN";
  return rows.slice(0, limit).map((b) => ({
    title: b.title,
    description: b.description,
    imageAlt: getBlogFeaturedImageAlt({
      title: b.title,
      featuredImageAlt: b.featuredImageAlt,
    }),
    href: `/blog/${b.slug}`,
    date: new Date(b.updatedAt || b.publishDate).toLocaleDateString(dateLocale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    image:
      b.featuredImage && b.featuredImage.trim() !== "" ? b.featuredImage : null,
  }));
}

export default async function HomeLatestBlogs() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Home" });
  const latestBlogs = await getLatestBlogs(3, locale);

  if (latestBlogs.length === 0) {
    return null;
  }

  return (
    <section
      className="py-14 md:py-16 bg-white border-t border-gray-100"
      aria-labelledby="latest-blog-heading"
    >
      <Container>
        <AnimateOnScroll
          animation="fadeInUp"
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <h2
              id="latest-blog-heading"
              className="text-[#052638] font-semibold text-3xl md:text-4xl mb-2"
            >
              {t("blog.heading")}
            </h2>
            <p className="text-[#27415c]">{t("blog.subheading")}</p>
          </div>
          <TrackedLink
            href="/blog"
            trackType="blog"
            trackTitle={t("blog.viewAll")}
            trackLocation="home_blog"
            className="inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline shrink-0"
          >
            {t("blog.viewAll")}
            <span aria-hidden>→</span>
          </TrackedLink>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestBlogs.map((post, idx) => (
            <AnimateOnScroll
              key={post.href}
              animation="fadeInUp"
              delay={idx * 80}
            >
              <HomeBlogCard
                href={post.href}
                title={post.title}
                description={post.description}
                date={post.date}
                image={post.image}
                imageAlt={post.imageAlt}
              />
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}

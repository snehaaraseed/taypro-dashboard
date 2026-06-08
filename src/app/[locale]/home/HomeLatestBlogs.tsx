import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
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
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline shrink-0"
          >
            {t("blog.viewAll")}
            <span aria-hidden>→</span>
          </Link>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestBlogs.map((post, idx) => (
            <AnimateOnScroll
              key={post.href}
              animation="fadeInUp"
              delay={idx * 80}
            >
              <Link
                href={post.href}
                className="group flex flex-col h-full rounded-xl border border-gray-200 overflow-hidden bg-[#f8fafb] hover:border-[#A8C117] hover:shadow-md transition"
              >
                <div className="relative aspect-[16/10] bg-[#eef3f8]">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      unoptimized={
                        post.image.startsWith("http") ||
                        post.image.startsWith("//")
                      }
                    />
                  ) : null}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <time className="text-xs text-[#5a8f00] font-medium mb-2">
                    {post.date}
                  </time>
                  <h3 className="text-[#052638] font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#5a8f00] transition-colors">
                    {post.title}
                  </h3>
                  {post.description ? (
                    <p className="text-[#27415c] text-sm line-clamp-2 flex-1">
                      {post.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}

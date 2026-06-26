import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { ProjectDetailChips } from "@/app/components/ProjectDetailChips";
import { ProjectHeroStats } from "@/app/components/ProjectHeroStats";
import type { ProjectHeroStat } from "@/lib/cms/project-detail-display";
import { shouldServeImageUnoptimized } from "@/lib/site-images";

const FALLBACK_HERO_IMAGE = "/tayprobglayout/taypro-project.png";

const HERO_GRADIENT =
  "linear-gradient(to right, rgba(5,38,56,0.97) 0%, rgba(5,38,56,0.92) 32%, rgba(5,38,56,0.72) 55%, rgba(5,38,56,0.45) 78%, rgba(5,38,56,0.25) 100%)";

type ProjectDetailHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  readingMinutes: number;
  minReadLabel: string;
  image?: string;
  imageAlt: string;
  tags: string[];
  stats: ProjectHeroStat[];
  authorName?: string;
  authorSlug?: string;
  authorRole?: string;
  waveFill?: string;
};

export function ProjectDetailHero({
  eyebrow,
  title,
  description,
  lastUpdated,
  readingMinutes,
  minReadLabel,
  image,
  imageAlt,
  tags,
  stats,
  authorName,
  authorSlug,
  authorRole,
  waveFill = "#ffffff",
}: ProjectDetailHeroProps) {
  const heroImage = image?.trim() || FALLBACK_HERO_IMAGE;

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
      <div className="relative min-h-[52vh] md:min-h-[60vh] lg:min-h-[62vh]">
        <Image
          src={heroImage}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          unoptimized={shouldServeImageUnoptimized(heroImage)}
        />
        <div
          className="absolute inset-0"
          style={{ background: HERO_GRADIENT }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(168,193,23,0.08)_0%,transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#052638]/90 via-transparent to-[#052638]/20"
          aria-hidden
        />

        <AnimateOnScroll
          animation="fadeInUp"
          eager
          className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-28 pt-28 md:px-8 md:pb-32 md:pt-32 lg:pb-36"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#A8C117] md:text-sm">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl text-3xl font-semibold leading-[1.12] text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/75">
            <span>{lastUpdated}</span>
            {readingMinutes > 0 ? (
              <>
                <span aria-hidden="true" className="text-white/35">
                  |
                </span>
                <span>{minReadLabel}</span>
              </>
            ) : null}
            {authorName && authorSlug ? (
              <>
                <span aria-hidden="true" className="text-white/35">
                  |
                </span>
                <Link
                  href={`/blog/author/${authorSlug}`}
                  className="font-medium text-white/90 transition-colors hover:text-[#A8C117]"
                >
                  {authorName}
                  {authorRole ? (
                    <span className="font-normal text-white/60">
                      {" "}
                      · {authorRole}
                    </span>
                  ) : null}
                </Link>
              </>
            ) : null}
          </div>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/88 md:text-lg md:leading-relaxed">
            {description}
          </p>

          {tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <ProjectDetailChips
                  key={tag}
                  items={[tag]}
                  className="inline-flex"
                  linkClassName="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-[#A8C117]/50 hover:bg-white/15 hover:text-white"
                  spanClassName="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
                />
              ))}
            </div>
          ) : null}

          <ProjectHeroStats stats={stats} />
        </AnimateOnScroll>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] overflow-hidden">
        <svg
          className="h-16 w-full md:h-24"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill={waveFill} d="M0,224L1440,96L1440,320L0,320Z" />
        </svg>
      </div>
    </section>
  );
}

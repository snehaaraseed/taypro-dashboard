import Image from "next/image";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import {
  PROJECTS_HERO_ACCENT,
  PROJECTS_HERO_IMAGES,
  type ProjectsHeroTone,
} from "@/lib/cms/projects-hero-config";

type ProjectsPageHeroProps = {
  tone?: ProjectsHeroTone;
  eyebrow: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  footer?: React.ReactNode;
  projectCount?: number;
  countBadgeLabel?: string;
  countBadgeUnit?: string;
};

export function ProjectsPageHero({
  tone = "hub",
  eyebrow,
  title,
  lead,
  footer,
  projectCount,
  countBadgeLabel = "Published",
  countBadgeUnit = "case studies",
}: ProjectsPageHeroProps) {
  const image = PROJECTS_HERO_IMAGES[tone];
  const accent = PROJECTS_HERO_ACCENT[tone];

  return (
    <section className="relative overflow-hidden bg-[#052638]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,193,23,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(168,193,23,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full blur-3xl ${accent.glow}`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#052638] via-[#052638] to-[#0a3548]"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-14 lg:py-24">
          <AnimateOnScroll
            animation="fadeInUp"
            eager
            className="lg:col-span-7 xl:col-span-6"
          >
            <div
              className={`mb-6 h-1 w-14 rounded-full bg-gradient-to-r ${accent.bar}`}
              aria-hidden
            />
            <p className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#A8C117]">
              {eyebrow}
            </p>
            <h1 className="mb-6 font-semibold text-3xl leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              {title}
            </h1>
            <div className="max-w-2xl text-base leading-relaxed text-white/78 sm:text-lg md:text-xl [&_a]:font-medium [&_a]:text-[#c3e052] [&_a]:underline-offset-4 hover:[&_a]:underline">
              {lead}
            </div>
            {footer ? <div className="mt-8 flex flex-wrap items-center gap-3">{footer}</div> : null}
          </AnimateOnScroll>

          <AnimateOnScroll
            animation="fadeInUp"
            eager
            delay={120}
            className="lg:col-span-5 xl:col-span-6"
          >
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div
                className={`absolute -inset-3 rounded-[1.35rem] bg-gradient-to-br ${accent.bar} opacity-25 blur-2xl`}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a3548]/50 shadow-2xl shadow-black/30 ring-1 ring-white/10">
                <div className="relative aspect-[5/4] sm:aspect-[4/3]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: image.objectPosition ?? "center",
                    }}
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#052638]/80 via-transparent to-transparent" />
                </div>
                {projectCount != null && projectCount > 0 ? (
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div className="rounded-xl border border-white/15 bg-[#052638]/85 px-4 py-3 backdrop-blur-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                        {countBadgeLabel}
                      </p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                        {projectCount}
                        <span className="ml-1.5 text-sm font-medium text-white/65">
                          {countBadgeUnit}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </Container>

      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-[#A8C117]/35 to-transparent"
        aria-hidden
      />
    </section>
  );
}

export function ProjectsSectionLabel({
  label,
  counter,
  tone = "light",
}: {
  label: string;
  counter?: string;
  tone?: "light" | "dark";
}) {
  const textClass = tone === "dark" ? "text-white/70" : "text-[#27415c]";
  const counterClass = tone === "dark" ? "text-white/40" : "text-[#27415c]/50";

  return (
    <p
      className={`mb-5 flex items-center gap-3 text-sm font-medium ${textClass}`}
    >
      <span className="text-[#A8C117]" aria-hidden>
        •
      </span>
      <span className="uppercase tracking-[0.18em]">{label}</span>
      {counter ? (
        <span
          className={`${counterClass} tabular-nums tracking-normal normal-case`}
        >
          ({counter})
        </span>
      ) : null}
    </p>
  );
}

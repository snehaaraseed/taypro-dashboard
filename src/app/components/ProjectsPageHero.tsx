import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import type { ProjectsHeroTone } from "@/lib/cms/projects-hero-config";

const DEFAULT_HERO_BACKGROUND = "/tayprobglayout/taypro-project.png";

type ProjectsPageHeroProps = {
  tone?: ProjectsHeroTone;
  eyebrow: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  footer?: React.ReactNode;
  projectCount?: number;
  countBadgeLabel?: string;
  countBadgeUnit?: string;
  /** SVG wave fill — should match the section directly below the hero. */
  waveFill?: string;
};

export function ProjectsPageHero({
  eyebrow,
  title,
  lead,
  footer,
  projectCount,
  countBadgeLabel = "Published",
  countBadgeUnit = "case studies",
  waveFill = "#f4f7f9",
}: ProjectsPageHeroProps) {
  const contentPadding = footer
    ? "pb-40 md:pb-48"
    : projectCount != null && projectCount > 0
      ? "pb-32 md:pb-36"
      : "pb-28 md:pb-32";

  return (
    <section className="relative flex min-h-[44vh] flex-col items-center justify-start overflow-x-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${DEFAULT_HERO_BACKGROUND}')`,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-white/90 sm:bg-white/85"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/55 to-white/80"
        aria-hidden
      />

      <AnimateOnScroll
        animation="fadeInUp"
        eager
        className={`relative z-10 mx-auto w-full max-w-4xl px-4 pt-10 text-center ${contentPadding}`}
      >
        <p className="mb-4 text-[16px] font-medium uppercase tracking-wide text-[#A8C117]">
          {eyebrow}
        </p>
        <h1 className="mb-6 font-semibold text-[#052638] text-4xl leading-tight md:text-5xl [&_span]:text-[#5a8f00]">
          {title}
        </h1>
        <div className="mx-auto max-w-3xl text-lg leading-relaxed text-[#22405a] md:text-xl [&_a]:font-medium [&_a]:text-[#5a8f00] [&_a]:underline-offset-4 hover:[&_a]:underline">
          {lead}
        </div>

        {projectCount != null && projectCount > 0 ? (
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[#A8C117]/25 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-sm">
            <p className="text-3xl font-semibold tabular-nums text-[#5a8f00]">
              {projectCount}
            </p>
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#27415c]/70">
                {countBadgeLabel}
              </p>
              <p className="text-sm font-medium text-[#052638]">
                {countBadgeUnit}
              </p>
            </div>
          </div>
        ) : null}

        {footer ? (
          <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {footer}
          </div>
        ) : null}
      </AnimateOnScroll>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] overflow-hidden">
        <svg
          className="h-20 w-full md:h-32"
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

export function ProjectsSectionLabel({
  label,
  counter,
  tone = "light",
}: {
  label: string;
  counter?: string;
  tone?: "light" | "dark";
}) {
  const pillClass =
    tone === "dark"
      ? "border-white/15 bg-white/5 text-[#A8C117]"
      : "border-[#A8C117]/25 bg-[#A8C117]/8 text-[#5a8f00]";
  const counterClass = tone === "dark" ? "text-white/45" : "text-[#27415c]/50";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <p
        className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] ${pillClass}`}
      >
        {label}
      </p>
      {counter ? (
        <span
          className={`text-sm font-medium tabular-nums tracking-normal ${counterClass}`}
        >
          {counter}
        </span>
      ) : null}
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import { Droplets, Gauge, LayoutGrid, Leaf } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { tayproHomeStatsStrip } from "@/app/data";

const STAT_ICONS: LucideIcon[] = [Gauge, LayoutGrid, Leaf, Droplets];
const PROJECTS_HREF = "/projects";

/** Fleet-impact cards — clear glass, links to projects. */
export default async function HomeHeroStats() {
  const tStats = await getTranslations("Home.stats");
  const tHero = await getTranslations("Home.hero");

  const stats = tayproHomeStatsStrip.map((stat, i) => ({
    value: stat.value,
    label: tStats(`stat${i}.label`),
    sublabel: tStats.has(`stat${i}.sublabel`) ? tStats(`stat${i}.sublabel`) : null,
    icon: STAT_ICONS[i],
  }));

  const [featuredStat, ...supportingStats] = stats;
  const FeaturedIcon = featuredStat.icon;

  return (
    <div className="mx-auto w-full max-w-6xl text-left" aria-label={tHero("statsAriaLabel")}>
      <Link
        href={PROJECTS_HREF}
        className="hero-glass hero-glass-link block rounded-2xl p-6 md:p-8 lg:flex lg:items-center lg:gap-10"
      >
        <div className="flex items-center gap-4 md:gap-6 lg:shrink-0">
          <span className="hero-glass-icon inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl md:h-16 md:w-16">
            <FeaturedIcon className="h-7 w-7 text-[#A8C117] md:h-8 md:w-8" aria-hidden />
          </span>
          <p className="text-[#A8C117] font-semibold text-4xl sm:text-5xl md:text-6xl tabular-nums tracking-tight drop-shadow-sm">
            {featuredStat.value}
          </p>
        </div>
        <div className="mt-5 lg:mt-0 lg:max-w-2xl">
          <p className="text-white font-semibold text-lg md:text-xl leading-snug drop-shadow-sm">
            {featuredStat.label}
          </p>
          {featuredStat.sublabel ? (
            <p className="text-white/75 text-sm md:text-base leading-relaxed mt-2">
              {featuredStat.sublabel}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mt-5">
        {supportingStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={PROJECTS_HREF}
              className="hero-glass hero-glass-link flex items-center gap-3 rounded-2xl p-4 sm:gap-4"
            >
              <span className="hero-glass-icon inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11">
                <Icon className="h-5 w-5 text-[#A8C117]" aria-hidden />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-[#A8C117] font-semibold text-2xl sm:text-3xl tabular-nums tracking-tight leading-none drop-shadow-sm">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-white/85 text-xs sm:text-sm leading-snug">
                  {stat.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

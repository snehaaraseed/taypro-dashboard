import type { LucideIcon } from "lucide-react";
import { Bot, Gauge, Layers, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ProjectHeroStat } from "@/lib/cms/project-detail-display";

const STAT_ICONS: Record<string, LucideIcon> = {
  Capacity: Gauge,
  Fleet: Bot,
  Location: MapPin,
  Deployment: Layers,
};

type ProjectHeroStatsProps = {
  stats: ProjectHeroStat[];
};

function statLabelKey(label: string): string | null {
  switch (label) {
    case "Capacity":
      return "statCapacity";
    case "Fleet":
      return "statFleet";
    case "Location":
      return "statLocation";
    case "Deployment":
      return "statDeployment";
    default:
      return null;
  }
}

export async function ProjectHeroStats({ stats }: ProjectHeroStatsProps) {
  if (stats.length === 0) return null;

  const t = await getTranslations("ProjectDetailPage");
  const [featured, ...supporting] = stats;
  const FeaturedIcon = STAT_ICONS[featured.label] ?? Gauge;
  const featuredKey = statLabelKey(featured.label);

  return (
    <div
      className="mt-8 md:mt-10"
      aria-label={t("heroStatsAriaLabel")}
    >
      <div className="hero-glass rounded-2xl p-5 md:p-6 lg:flex lg:items-center lg:gap-8">
        <div className="flex items-center gap-4 md:gap-5 lg:shrink-0">
          <span className="hero-glass-icon inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl md:h-14 md:w-14">
            <FeaturedIcon
              className="h-6 w-6 text-[#A8C117] md:h-7 md:w-7"
              aria-hidden
            />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
              {featuredKey ? t(featuredKey) : featured.label}
            </p>
            <p className="text-[#A8C117] font-semibold text-3xl sm:text-4xl tabular-nums tracking-tight drop-shadow-sm">
              {featured.value}
            </p>
          </div>
        </div>
        {supporting.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-0 lg:flex-1">
            {supporting.map((stat) => {
              const Icon = STAT_ICONS[stat.label] ?? Layers;
              const key = statLabelKey(stat.label);
              return (
                <div
                  key={`${stat.label}-${stat.value}`}
                  className="hero-glass flex items-center gap-3 rounded-xl p-3.5 sm:p-4"
                >
                  <span className="hero-glass-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4 text-[#A8C117]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                      {key ? t(key) : stat.label}
                    </p>
                    <p className="text-white font-semibold text-lg sm:text-xl tabular-nums leading-tight drop-shadow-sm">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

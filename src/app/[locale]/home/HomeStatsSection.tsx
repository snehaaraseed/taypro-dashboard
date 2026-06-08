import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import { Droplets, Gauge, LayoutGrid, Leaf } from "lucide-react";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import { tayproHomeStatsStrip } from "@/app/data";
import { PERFORMANCE_METHODOLOGY_PATH } from "@/lib/seo/performance-methodology";

const STAT_ICONS: LucideIcon[] = [Gauge, LayoutGrid, Leaf, Droplets];

export default async function HomeStatsSection() {
  const t = await getTranslations("Home.stats");

  const stats = tayproHomeStatsStrip.map((stat, i) => ({
    value: stat.value,
    label: t(`stat${i}.label`),
    sublabel: t.has(`stat${i}.sublabel`) ? t(`stat${i}.sublabel`) : null,
    icon: STAT_ICONS[i],
  }));

  const [featuredStat, ...supportingStats] = stats;
  const FeaturedIcon = featuredStat.icon;

  return (
    <section
      className="w-full border-y border-gray-200/80 bg-[#f4f7f9] py-10 md:py-14"
      aria-label="Fleet impact metrics"
    >
      <Container>
        <AnimateOnScroll animation="fadeInUp">
          <article className="rounded-2xl border border-[#A8C117]/25 bg-white p-6 shadow-sm ring-1 ring-[#A8C117]/10 md:p-8 lg:flex lg:items-center lg:gap-10">
            <div className="flex items-center gap-4 md:gap-6 lg:shrink-0">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#A8C117]/20 bg-[#A8C117]/10">
                <FeaturedIcon className="h-7 w-7 text-[#5a8f00]" aria-hidden />
              </span>
              <p className="text-[#5a8f00] font-semibold text-4xl sm:text-5xl md:text-6xl tabular-nums tracking-tight">
                {featuredStat.value}
              </p>
            </div>
            <div className="mt-5 lg:mt-0 lg:max-w-2xl">
              <h3 className="text-[#052638] font-semibold text-lg md:text-xl leading-snug">
                {featuredStat.label}
              </h3>
              {featuredStat.sublabel ? (
                <p className="text-[#5a7a8f] text-sm md:text-base leading-relaxed mt-2">
                  {featuredStat.sublabel}
                </p>
              ) : null}
            </div>
          </article>
        </AnimateOnScroll>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:mt-5 md:gap-5">
          {supportingStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <AnimateOnScroll
                key={stat.label}
                animation="fadeInUp"
                delay={(idx + 1) * 80}
              >
                <article className="group flex h-full flex-col rounded-2xl border border-gray-200/80 bg-white p-5 text-center shadow-sm transition-all hover:border-[#A8C117]/40 hover:shadow-md md:p-6">
                  <span className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-100 bg-[#f4f7f9] transition-colors group-hover:border-[#A8C117]/25 group-hover:bg-[#A8C117]/8">
                    <Icon className="h-5 w-5 text-[#5a8f00]" aria-hidden />
                  </span>
                  <p className="text-[#5a8f00] font-semibold text-2xl sm:text-3xl md:text-4xl mb-2 tabular-nums tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[#27415c] text-xs sm:text-sm leading-snug">{stat.label}</p>
                </article>
              </AnimateOnScroll>
            );
          })}
        </div>

        <AnimateOnScroll animation="fadeInUp" delay={320}>
          <p className="mt-8 rounded-xl border border-gray-200/80 bg-white/80 px-4 py-3.5 text-center text-[#5a7a8f] text-xs sm:text-sm max-w-3xl mx-auto leading-relaxed">
            {t("methodologyBefore")}{" "}
            <Link
              href={PERFORMANCE_METHODOLOGY_PATH}
              className="text-[#5a8f00] font-medium underline-offset-2 hover:underline"
            >
              {t("methodologyLink")}
            </Link>{" "}
            {t("methodologyAfter")}
          </p>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}

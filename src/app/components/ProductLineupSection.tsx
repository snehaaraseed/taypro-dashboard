"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import ProductLineupRow from "@/app/components/ProductLineupRow";
import type {
  ProductLineupFilter,
  ProductLineupRobot,
} from "@/lib/products/build-product-lineup";

const FILTER_OPTIONS: ProductLineupFilter[] = [
  "all",
  "fixed_tilt",
  "tracker",
  "distributed",
  "service",
  "software",
];

function matchesFilter(robot: ProductLineupRobot, filter: ProductLineupFilter): boolean {
  if (filter === "all") return true;
  return robot.filterTags.includes(filter);
}

export type ProductLineupSectionProps = {
  headingId: string;
  messagesNamespace: string;
  eyebrow: string;
  heading: string;
  subheading?: ReactNode;
  hardwareRobots: ProductLineupRobot[];
  solutionRobots: ProductLineupRobot[];
  sectionClassName?: string;
};

export default function ProductLineupSection({
  headingId,
  messagesNamespace,
  eyebrow,
  heading,
  subheading,
  hardwareRobots,
  solutionRobots,
  sectionClassName = "py-14 md:py-20 bg-white",
}: ProductLineupSectionProps) {
  const t = useTranslations(messagesNamespace);
  const [filter, setFilter] = useState<ProductLineupFilter>("all");

  const visibleHardware = useMemo(
    () => hardwareRobots.filter((robot) => matchesFilter(robot, filter)),
    [hardwareRobots, filter]
  );
  const visibleSolutions = useMemo(
    () => solutionRobots.filter((robot) => matchesFilter(robot, filter)),
    [solutionRobots, filter]
  );

  const visibleRobots = useMemo(
    () => [...visibleHardware, ...visibleSolutions],
    [visibleHardware, visibleSolutions]
  );

  const showEmpty = visibleRobots.length === 0;
  const lineupShellClass =
    "mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-16";

  return (
    <section className={sectionClassName} aria-labelledby={headingId}>
      <Container>
        <div className={lineupShellClass}>
          <AnimateOnScroll animation="fadeInUp" className="mb-8 md:mb-10">
            <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
              {eyebrow}
            </p>
            <h2
              id={headingId}
              className="text-[#052638] font-semibold text-3xl md:text-[35px] mb-3 leading-tight"
            >
              {heading}
            </h2>
            {subheading ? (
              <div className="text-[#27415c] text-base md:text-lg leading-relaxed max-w-3xl">
                {subheading}
              </div>
            ) : null}
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeInUp" delay={60} className="mb-10 md:mb-12">
            <p className="text-[#27415c] text-sm md:text-base font-medium mb-4">
              {t("filterPrompt")}
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={t("filterAriaLabel")}
            >
              {FILTER_OPTIONS.map((option) => {
                const active = filter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    aria-pressed={active}
                    className={`min-h-10 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#052638] text-white shadow-sm"
                        : "border border-gray-200 bg-white text-[#27415c] hover:border-[#A8C117] hover:text-[#052638]"
                    }`}
                  >
                    {t(`filters.${option}`)}
                  </button>
                );
              })}
            </div>
          </AnimateOnScroll>

          {showEmpty ? (
            <p className="text-[#5a7a8f] text-sm md:text-base max-w-xl">
              {t("filterEmpty")}
            </p>
          ) : (
            <div>
              {visibleRobots.map((robot, idx) => (
                <AnimateOnScroll
                  key={robot.model}
                  animation="fadeInUp"
                  delay={idx * 50}
                >
                  <ProductLineupRow
                    model={robot.model}
                    marketingName={robot.marketingName}
                    description={robot.description}
                    href={robot.href}
                    topViewPath={robot.topViewPath}
                    topViewWidth={robot.topViewWidth}
                    topViewHeight={robot.topViewHeight}
                    layout={robot.lineupLayout}
                    exploreLabel={t("exploreCta", { model: robot.model })}
                    priority={false}
                  />
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

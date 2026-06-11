"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import { RobotCard } from "@/app/components/RobotCard";
import {
  HARDWARE_ROBOTS_GRID_HOME,
  hardwareRobotsGridItemClass,
} from "@/lib/products/robot-grid-layout";
export type HomeRobotFilter =
  | "all"
  | "fixed_tilt"
  | "tracker"
  | "distributed"
  | "service"
  | "software";

export type HomeLineupRobot = {
  model: string;
  marketingName?: string;
  description: string;
  imgPath: string;
  href: string;
  filterTags: HomeRobotFilter[];
};

const FILTER_OPTIONS: HomeRobotFilter[] = [
  "all",
  "fixed_tilt",
  "tracker",
  "distributed",
  "service",
  "software",
];

type HomeRobotLineupProps = {
  hardwareRobots: HomeLineupRobot[];
  solutionRobots: HomeLineupRobot[];
};

function matchesFilter(robot: HomeLineupRobot, filter: HomeRobotFilter): boolean {
  if (filter === "all") return true;
  return robot.filterTags.includes(filter);
}

export default function HomeRobotLineup({
  hardwareRobots,
  solutionRobots,
}: HomeRobotLineupProps) {
  const t = useTranslations("Home.robots");
  const [filter, setFilter] = useState<HomeRobotFilter>("all");

  const visibleHardware = useMemo(
    () => hardwareRobots.filter((robot) => matchesFilter(robot, filter)),
    [hardwareRobots, filter]
  );
  const visibleSolutions = useMemo(
    () => solutionRobots.filter((robot) => matchesFilter(robot, filter)),
    [solutionRobots, filter]
  );

  const showHardware = visibleHardware.length > 0;
  const showSolutions = visibleSolutions.length > 0;
  const showEmpty = !showHardware && !showSolutions;

  return (
    <section
      className="py-14 md:py-20 bg-white"
      aria-labelledby="robots-heading"
    >
      <Container>
        <AnimateOnScroll animation="fadeInUp" className="text-center max-w-3xl mx-auto mb-8">
          <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
            {t("eyebrow")}
          </p>
          <h2
            id="robots-heading"
            className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
          >
            {t("heading")}
          </h2>
          <p className="text-[#27415c] text-base md:text-lg leading-relaxed">
            {t("subheadingBefore")}{" "}
            <Link
              href="/solar-panel-cleaning-system"
              className="text-[#5a8f00] font-medium hover:underline"
            >
              {t("compareLink")}
            </Link>
            {t("subheadingAfter")}
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fadeInUp" delay={60} className="max-w-4xl mx-auto mb-10">
          <p className="text-center text-[#27415c] text-sm md:text-base font-medium mb-4">
            {t("filterPrompt")}
          </p>
          <div
            className="flex flex-wrap justify-center gap-2"
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
          <p className="text-center text-[#5a7a8f] text-sm md:text-base max-w-xl mx-auto">
            {t("filterEmpty")}
          </p>
        ) : (
          <div className="space-y-12">
            {showHardware ? (
              <div>
                <p className="text-[#5a7a8f] font-medium text-xs uppercase tracking-wider mb-5 text-center">
                  {t("waterlessEyebrow")}
                </p>
                <div
                  className={
                    filter === "all" && visibleHardware.length === hardwareRobots.length
                      ? HARDWARE_ROBOTS_GRID_HOME
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch"
                  }
                >
                  {visibleHardware.map((robot, idx) => (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="fadeInUp"
                      delay={idx * 70}
                      className={
                        filter === "all" && visibleHardware.length === hardwareRobots.length
                          ? hardwareRobotsGridItemClass(
                              hardwareRobots.findIndex((r) => r.model === robot.model),
                              "home"
                            )
                          : "h-full w-full"
                      }
                    >
                      <RobotCard
                        robot={robot}
                        priority={idx === 0 && filter === "all"}
                        preferGenericTitle
                      />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            ) : null}

            {showSolutions ? (
              <div>
                <p className="text-[#5a7a8f] font-medium text-xs uppercase tracking-wider mb-5 text-center">
                  {t("serviceEyebrow")}
                </p>
                <div
                  className={
                    visibleSolutions.length === 1
                      ? "grid grid-cols-1 max-w-md mx-auto gap-6"
                      : "grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 items-stretch lg:grid-cols-6"
                  }
                >
                  {visibleSolutions.map((robot, idx) => (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="fadeInUp"
                      delay={idx * 70}
                      className={
                        visibleSolutions.length > 1
                          ? `h-full lg:col-span-2 ${
                              idx === 0 ? "lg:col-start-2" : "lg:col-start-4"
                            }`
                          : "h-full"
                      }
                    >
                      <RobotCard robot={robot} preferGenericTitle />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Container>
    </section>
  );
}

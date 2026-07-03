"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ProductLineupSection from "@/app/components/ProductLineupSection";
import { robotLineupSolutions } from "@/app/data";
import { buildProductLineupRobots } from "@/lib/products/build-product-lineup";

const HARDWARE_DESC_KEYS = [
  "glyde",
  "glydeX",
  "nyuma",
  "nyumaX",
  "helyx",
] as const;

const COMPANY_SOLUTION_MODELS = new Set(["Opex", "NECTYR"]);

export function CompanySolutionsLineup() {
  const t = useTranslations("CompanyPage");

  const { hardwareRobots, solutionRobots } = useMemo(() => {
    const lineup = buildProductLineupRobots({
      describeHardware: (i) => ({
        description: t(`solutions.robots.${HARDWARE_DESC_KEYS[i]}`),
      }),
      describeSolution: (i) => {
        const robot = robotLineupSolutions[i]!;
        if (robot.model === "Opex") {
          return {
            marketingName: robot.marketingName,
            description: t("solutions.robots.tayproOpex"),
          };
        }
        if (robot.model === "NECTYR") {
          return {
            marketingName: robot.marketingName,
            description: t("solutions.robots.nectyr"),
          };
        }
        return {
          marketingName: robot.marketingName,
          description: robot.description,
        };
      },
    });

    return {
      hardwareRobots: lineup.hardwareRobots,
      solutionRobots: lineup.solutionRobots.filter((robot) =>
        COMPANY_SOLUTION_MODELS.has(robot.model)
      ),
    };
  }, [t]);

  return (
    <ProductLineupSection
      headingId="company-solutions-heading"
      messagesNamespace="Home.robots"
      eyebrow={t("solutions.eyebrow")}
      heading={t("solutions.heading")}
      subheading={
        <>
          {t("solutions.bodyBeforeLink")}{" "}
          <Link
            href="/cleaning-technology"
            className="brand-inline-link font-medium"
          >
            {t("solutions.bodyLink")}
          </Link>
          {t("solutions.bodyAfterLink")}
        </>
      }
      hardwareRobots={hardwareRobots}
      solutionRobots={solutionRobots}
      sectionClassName="w-full py-16 md:py-20 bg-[#f4f7f9]"
    />
  );
}

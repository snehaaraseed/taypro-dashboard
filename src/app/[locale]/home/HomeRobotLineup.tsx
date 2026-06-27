import type { ReactNode } from "react";
import ProductLineupSection from "@/app/components/ProductLineupSection";
import type { ProductLineupRobot } from "@/lib/products/build-product-lineup";

export type { ProductLineupRobot as HomeLineupRobot };
export type { ProductLineupLayout as HomeLineupLayout } from "@/lib/products/build-product-lineup";

type HomeRobotLineupProps = {
  eyebrow: string;
  heading: string;
  subheading: ReactNode;
  hardwareRobots: ProductLineupRobot[];
  solutionRobots: ProductLineupRobot[];
};

export default function HomeRobotLineup({
  eyebrow,
  heading,
  subheading,
  hardwareRobots,
  solutionRobots,
}: HomeRobotLineupProps) {
  return (
    <ProductLineupSection
      headingId="robots-heading"
      messagesNamespace="Home.robots"
      eyebrow={eyebrow}
      heading={heading}
      subheading={subheading}
      hardwareRobots={hardwareRobots}
      solutionRobots={solutionRobots}
    />
  );
}

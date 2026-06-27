import { robotLineupSolutions, robotProducts } from "@/app/data";
import {
  getProductLineupImageDimensions,
  getProductLineupImagePath,
  getProductLineupLayout,
  PRODUCT_CATALOG,
  type ProductId,
} from "@/lib/products/catalog";

export type ProductLineupFilter =
  | "all"
  | "fixed_tilt"
  | "tracker"
  | "distributed"
  | "service"
  | "software";

export type ProductLineupLayout = "full" | "split" | "text";

export type ProductLineupRobot = {
  model: string;
  marketingName?: string;
  description: string;
  imgPath: string;
  href: string;
  filterTags: ProductLineupFilter[];
  topViewPath?: string;
  topViewWidth?: number;
  topViewHeight?: number;
  lineupLayout: ProductLineupLayout;
};

const PLANT_TYPE_TO_FILTER = {
  fixed_tilt: ["fixed_tilt"],
  tracker: ["tracker"],
  distributed: ["distributed"],
} as const;

function solutionFilterTags(model: string): ProductLineupFilter[] {
  if (model === "Opex") return ["service"];
  if (model === "NECTYR" || model === "ORION") return ["software"];
  if (model === "CRADYL" || model === "MINY") return ["distributed"];
  return [];
}

type RobotCopy = { marketingName?: string; description: string };

export function buildProductLineupRobots(options: {
  describeHardware: (index: number) => RobotCopy;
  describeSolution: (index: number) => RobotCopy;
}): {
  hardwareRobots: ProductLineupRobot[];
  solutionRobots: ProductLineupRobot[];
} {
  const hardwareRobots = robotProducts.map((robot, i) => {
    const productId = "productId" in robot ? robot.productId : undefined;
    const plantType = productId ? PRODUCT_CATALOG[productId].plantType : undefined;
    const filterTags = plantType
      ? [...PLANT_TYPE_TO_FILTER[plantType as keyof typeof PLANT_TYPE_TO_FILTER]]
      : [];
    const copy = options.describeHardware(i);

    return {
      ...robot,
      ...copy,
      filterTags,
      topViewPath: productId ? getProductLineupImagePath(productId) : undefined,
      topViewWidth: productId
        ? getProductLineupImageDimensions(productId).width
        : undefined,
      topViewHeight: productId
        ? getProductLineupImageDimensions(productId).height
        : undefined,
      lineupLayout: productId ? getProductLineupLayout(productId) : "full",
    };
  });

  const solutionRobots = robotLineupSolutions.map((robot, i) => {
    const copy = options.describeSolution(i);
    return {
      ...robot,
      ...copy,
      filterTags: solutionFilterTags(robot.model),
      lineupLayout: "text" as const,
    };
  });

  return { hardwareRobots, solutionRobots };
}

export function hardwareProductIdAt(index: number): ProductId | undefined {
  const robot = robotProducts[index];
  return robot && "productId" in robot ? robot.productId : undefined;
}

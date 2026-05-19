/**
 * Layout helpers for the five hardware robot cards (3 + 2 rows).
 * Uses a 6-column grid so the last pair centers on wide breakpoints.
 */

export const HARDWARE_ROBOTS_GRID_HOME =
  "grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-8 items-stretch";

export const HARDWARE_ROBOTS_GRID_SOLAR =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8 items-stretch";

export function hardwareRobotsGridItemClass(
  index: number,
  variant: "home" | "solar"
): string {
  const classes = ["h-full w-full"];

  if (variant === "home") {
    classes.push("md:col-span-2");
    if (index === 3) classes.push("md:col-start-2");
    if (index === 4) classes.push("md:col-start-4");
    return classes.join(" ");
  }

  if (index === 4) {
    classes.push(
      "sm:col-span-2 sm:justify-self-center sm:max-w-[calc((100%-1.5rem)/2)]"
    );
  }

  classes.push("lg:col-span-2");
  if (index === 3) classes.push("lg:col-start-2");
  if (index === 4) classes.push("lg:col-start-4");

  return classes.join(" ");
}

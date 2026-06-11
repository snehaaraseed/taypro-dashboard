import type { CSSProperties } from "react";
import {
  computeHeroFitClamp,
  HERO_HEADLINE_FONT,
  HERO_HEADLINE_MOBILE_CLAMP,
  longestLineLength,
} from "./home-hero-typography";

type HomeHeroHeadlineProps = {
  titleLine1: string;
  titleLine2: string;
  titleMobileLines: [string, string, string, string];
};

export default function HomeHeroHeadline({
  titleLine1,
  titleLine2,
  titleMobileLines,
}: HomeHeroHeadlineProps) {
  const desktopFontSize = computeHeroFitClamp(
    longestLineLength(titleLine1, titleLine2),
    HERO_HEADLINE_FONT
  );

  const [mobileLine1, mobileLine2, mobileLine3, mobileLine4] = titleMobileLines;

  return (
    <div
      id="hero-headline-fit"
      className="hero-headline-fit relative w-full"
      style={
        {
          "--hero-headline-mobile": HERO_HEADLINE_MOBILE_CLAMP,
          "--hero-headline-desktop": desktopFontSize,
        } as CSSProperties
      }
    >
      <h1>
        {/* Mobile: explicit line breaks for readable wrapping */}
        <span className="sm:hidden">
          <span className="block font-semibold leading-tight text-white">
            {mobileLine1}
          </span>
          <span className="block font-semibold leading-tight text-white">
            {mobileLine2}
          </span>
          <span className="block font-semibold leading-tight text-white">
            {mobileLine3}
          </span>
          <span className="block font-semibold leading-tight text-white">
            {mobileLine4}
          </span>
        </span>

        {/* Desktop: single-line fit-to-width */}
        <span className="hidden space-y-1 sm:block sm:space-y-2">
          <span className="block whitespace-normal font-semibold leading-tight text-white sm:whitespace-nowrap">
            {titleLine1}
          </span>
          <span className="block whitespace-normal font-semibold leading-tight text-white sm:whitespace-nowrap">
            {titleLine2}
          </span>
        </span>
      </h1>
    </div>
  );
}

import type { CSSProperties } from "react";
import {
  computeHeroFitCqi,
  HERO_SUBHEAD_FONT,
  HERO_SUBHEAD_MOBILE_CLAMP,
  weightedLongestLineLength,
} from "./home-hero-typography";

type HomeHeroSubheadlineProps = {
  subtitleLine1: string;
  subtitleLine2: string;
};

export default function HomeHeroSubheadline({
  subtitleLine1,
  subtitleLine2,
}: HomeHeroSubheadlineProps) {
  const desktopFontSize = computeHeroFitCqi(
    weightedLongestLineLength(subtitleLine1, subtitleLine2),
    HERO_SUBHEAD_FONT
  );

  return (
    <div className="px-4 sm:px-10 md:px-14 lg:px-20">
      <div
        id="hero-subhead-fit"
        className="hero-subhead-fit relative w-full sm:[container-type:inline-size]"
        style={
          {
            "--hero-subhead-mobile": HERO_SUBHEAD_MOBILE_CLAMP,
            "--hero-subhead-desktop": desktopFontSize,
          } as CSSProperties
        }
      >
        <div className="space-y-1">
          <p className="whitespace-normal sm:whitespace-nowrap leading-relaxed text-white/95">
            {subtitleLine1}
          </p>
          <p className="whitespace-normal sm:whitespace-nowrap font-medium leading-relaxed text-[#A8C117]">
            {subtitleLine2}
          </p>
        </div>
      </div>
    </div>
  );
}

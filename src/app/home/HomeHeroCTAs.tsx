"use client";

import Link from "next/link";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";

export default function HomeHeroCTAs() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
      <OpenLeadModalButton
        topic="Homepage — request a quote"
        title="Talk to Taypro"
        subtitle="Share your plant capacity and layout—we'll recommend the right solar panel cleaning robot or Opex service for your site."
        className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-7 py-3 rounded-lg hover:bg-[#b3cf3d] transition text-center"
      >
        Request a quote
      </OpenLeadModalButton>
      <Link
        href="/solar-panel-cleaning-system"
        className="inline-flex items-center justify-center min-h-[48px] border-2 border-white/80 text-white font-medium px-7 py-3 rounded-lg hover:bg-white/10 transition text-center"
      >
        Explore robots
      </Link>
      <Link
        href="/solar-panel-cleaning-robot-price-calculator"
        className="inline-flex items-center justify-center min-h-[48px] text-[#A8C117] font-medium px-4 py-3 hover:underline text-center"
      >
        ROI calculator →
      </Link>
    </div>
  );
}

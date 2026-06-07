"use client";

import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";

type HomeHeroQuoteButtonProps = {
  label: string;
  topic: string;
  title: string;
  subtitle: string;
};

/** Only the quote CTA needs client JS (lead modal); links stay server-rendered. */
export default function HomeHeroQuoteButton({
  label,
  topic,
  title,
  subtitle,
}: HomeHeroQuoteButtonProps) {
  return (
    <OpenLeadModalButton
      topic={topic}
      title={title}
      subtitle={subtitle}
      className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-7 py-3 rounded-lg hover:bg-[#b3cf3d] transition text-center"
    >
      {label}
    </OpenLeadModalButton>
  );
}

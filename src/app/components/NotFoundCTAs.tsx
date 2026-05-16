"use client";

import { Link } from "@/i18n/navigation";
import OpenLeadModalButton from "@/app/components/OpenLeadModalButton";

type NotFoundCTAsProps = {
  quoteLabel: string;
  quoteTopic: string;
  quoteTitle: string;
  quoteSubtitle: string;
  contactLabel: string;
};

export default function NotFoundCTAs({
  quoteLabel,
  quoteTopic,
  quoteTitle,
  quoteSubtitle,
  contactLabel,
}: NotFoundCTAsProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
      <OpenLeadModalButton
        topic={quoteTopic}
        title={quoteTitle}
        subtitle={quoteSubtitle}
        className="inline-flex items-center justify-center min-h-[48px] bg-[#A8C117] text-[#052638] font-semibold px-7 py-3 rounded-lg hover:bg-[#b3cf3d] transition"
      >
        {quoteLabel}
      </OpenLeadModalButton>
      <Link
        href="/contact"
        className="inline-flex items-center justify-center min-h-[48px] border-2 border-[#052638]/20 text-[#052638] font-medium px-7 py-3 rounded-lg hover:bg-[#052638]/5 transition"
      >
        {contactLabel}
      </Link>
    </div>
  );
}

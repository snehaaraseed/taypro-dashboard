"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import RequestEstimateForm from "./RequestEstimateForm";
import { useLeadModal } from "./LeadModalContext";

const DEFAULT_TITLE = "Tell us about your plant";
const DEFAULT_SUBTITLE =
  "A few quick details and our applications team will reach out with the right Solar Panel Cleaning Robot fit for your site.";

export default function LeadModal() {
  const { state, closeLeadModal } = useLeadModal();
  const { isOpen, topic, title, subtitle } = state;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLeadModal();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, closeLeadModal]);

  if (!isOpen || !mounted) return null;

  const resolvedTitle = title ?? DEFAULT_TITLE;
  const resolvedSubtitle = subtitle ?? DEFAULT_SUBTITLE;
  const heroEyebrow = topic?.trim() || "Taypro plant check";

  const panel = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        onClick={closeLeadModal}
        className="taypro-lead-backdrop absolute inset-0 bg-[#031b29]/90 backdrop-blur-md"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="taypro-lead-panel relative z-10 flex max-h-[92vh] w-full max-w-[33.8rem] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_80px_-12px_rgba(5,38,56,0.45)] sm:max-w-[36.4rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-40 shrink-0 overflow-hidden bg-gradient-to-br from-[#021a24] via-[#052638] to-[#0a4a66] sm:h-44">
          <Image
            src="/tayproasset/taypro-robotImage.png"
            alt="Taypro solar panel cleaning robot"
            fill
            className="scale-105 object-cover object-center opacity-35 mix-blend-luminosity"
            sizes="(max-width: 640px) 100vw, 36rem"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#052638] via-transparent to-transparent" />
          <div className="absolute right-3 top-3 flex items-center gap-2 sm:right-4 sm:top-4">
            <span className="rounded-full bg-[#A8C117]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#d4e884] ring-1 ring-[#A8C117]/40 sm:px-3.5 sm:py-1.5 sm:text-sm">
              Free, about 1 minute
            </span>
            <button
              type="button"
              onClick={closeLeadModal}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] sm:h-11 sm:w-11"
              aria-label="Close"
            >
              <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
                ×
              </span>
            </button>
          </div>
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-5 sm:right-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8C117] sm:text-sm">
              {heroEyebrow}
            </p>
            <h2
              id="lead-modal-title"
              className="mt-1.5 text-xl font-semibold leading-snug text-white sm:text-2xl md:text-[1.65rem] md:leading-tight"
            >
              {resolvedTitle}
            </h2>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-white to-[#f4f7f8] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <p className="text-base leading-relaxed text-[#22405a] sm:text-lg">{resolvedSubtitle}</p>

          <div className="mt-5 rounded-xl border border-[#e2e8ec] bg-white/95 p-4 shadow-sm sm:mt-6 sm:p-5">
            <p className="mb-4 text-sm font-semibold text-[#052638] sm:text-base">
              Where should we send your fit check?
            </p>
            <RequestEstimateForm
              variant="embedded"
              showEmbeddedHeading={false}
              stackedEmbedded
              embeddedFlush
              messageRows={3}
              messageLabel="What should we know about your plant?"
              messagePlaceholder="MW, fixed-tilt or trackers, soiling or water limits, how you clean today, and what you want to improve."
              submitLabel="Send my fit check"
              autoFocus
              redirectOnSuccess={false}
              hideResetAfterSuccess
              thankYouTitle="Got it, your fit check is on the way"
              thankYouMessage="Our applications team will follow up shortly with the right Solar Panel Cleaning Robot direction for your plant."
              onSuccess={() => {
                window.setTimeout(closeLeadModal, 2800);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

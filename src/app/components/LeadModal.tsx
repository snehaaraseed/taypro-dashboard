"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { lockPageScroll } from "@/lib/scroll-lock";
import { getOverlayPortalRoot } from "@/lib/overlay-portal";
import RequestEstimateForm from "./RequestEstimateForm";
import { useLeadModal } from "./LeadModalContext";
import {
  DEFAULT_LEAD_MODAL_FORM_PROMPT,
  DEFAULT_LEAD_MODAL_SUBTITLE,
  DEFAULT_LEAD_MODAL_TITLE,
} from "./lead-modal-options";

export default function LeadModal() {
  const { state, closeLeadModal } = useLeadModal();
  const {
    isOpen,
    topic,
    title,
    subtitle,
    source,
    leadIntent,
    formPrompt,
    showMessageField,
    showCompanyField,
    messageLabel,
    messagePlaceholder,
    submitLabel,
    thankYouTitle,
    thankYouMessage,
    analyticsFormType,
  } = state;
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
    const unlockScroll = lockPageScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [isOpen, closeLeadModal]);

  if (!isOpen || !mounted) return null;

  const resolvedTitle = title ?? DEFAULT_LEAD_MODAL_TITLE;
  const resolvedSubtitle = subtitle ?? DEFAULT_LEAD_MODAL_SUBTITLE;
  const resolvedFormPrompt = formPrompt ?? DEFAULT_LEAD_MODAL_FORM_PROMPT;
  const heroEyebrow = topic?.trim() || "Taypro plant check";

  const panel = (
    <div className="taypro-lead-modal-root fixed inset-0 flex items-center justify-center p-4 sm:p-6">
      <div
        className="taypro-lead-backdrop absolute inset-0 bg-[#031b29]/90 backdrop-blur-md"
        aria-hidden="true"
        onClick={closeLeadModal}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="taypro-lead-panel relative z-[2] flex max-h-[92vh] w-full max-w-[33.8rem] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_80px_-12px_rgba(5,38,56,0.45)] sm:max-w-[36.4rem]"
      >
        <div className="relative h-40 shrink-0 overflow-hidden bg-gradient-to-br from-[#021a24] via-[#052638] to-[#0a4a66] sm:h-44">
          <Image
            src="/tayproasset/taypro-robotImage.png"
            alt="Taypro solar panel cleaning robot"
            fill
            className="pointer-events-none scale-105 object-cover object-center opacity-35 mix-blend-luminosity"
            sizes="(max-width: 640px) 100vw, 36rem"
            priority={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#052638] via-transparent to-transparent" />
          <div className="absolute right-3 top-3 z-20 flex items-center gap-2 sm:right-4 sm:top-4">
            <span className="rounded-full bg-[#A8C117]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#d4e884] ring-1 ring-[#A8C117]/40 sm:px-3.5 sm:py-1.5 sm:text-sm">
              Free, about 1 minute
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                closeLeadModal();
              }}
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
          <p className="text-base leading-relaxed text-[#22405a] sm:text-lg">
            {resolvedSubtitle}
          </p>

          <div className="mt-5 rounded-xl border border-[#e2e8ec] bg-white/95 p-4 shadow-sm sm:mt-6 sm:p-5">
            <p className="mb-4 text-sm font-semibold text-[#052638] sm:text-base">
              {resolvedFormPrompt}
            </p>
            <RequestEstimateForm
              variant="embedded"
              showEmbeddedHeading={false}
              stackedEmbedded
              embeddedFlush
              showMessageField={showMessageField}
              showCompanyField={showCompanyField}
              messageLabel={messageLabel}
              messagePlaceholder={messagePlaceholder}
              submitLabel={submitLabel ?? "Send my fit check"}
              autoFocus
              hideResetAfterSuccess
              thankYouTitle={thankYouTitle ?? "Got it, your fit check is on the way"}
              thankYouMessage={
                thankYouMessage ??
                "Our applications team will follow up shortly with the right Solar Panel Cleaning Robot direction for your plant."
              }
              analyticsFormType={analyticsFormType ?? "lead_modal"}
              analyticsSource={source}
              analyticsTopic={topic}
              leadIntent={leadIntent ?? topic?.trim() ?? "Plant fit check (modal)"}
              onSuccess={() => {
                window.setTimeout(closeLeadModal, 2800);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(panel, getOverlayPortalRoot());
}

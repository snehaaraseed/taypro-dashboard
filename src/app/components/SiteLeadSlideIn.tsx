"use client";

import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { PLANT_CHECK_PERKS } from "@/app/components/plantCheckPerks";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "@/i18n/navigation";
import { lockPageScroll } from "@/lib/scroll-lock";
import { getOverlayPortalRoot } from "@/lib/overlay-portal";
import { trackSlideInOpen } from "@/lib/analytics/track-event";
import { LeadModalContext } from "./LeadModalContext";

const STORAGE_DISMISS_SLOT = "taypro_lead_slidein_dismiss_slot";

/** Dev only: set `localStorage.setItem("TAYPRO_DEBUG_LEAD_POPUP", "1")` then refresh to ignore the dismiss gate while testing. */
const DEBUG_LEAD_POPUP_KEY = "TAYPRO_DEBUG_LEAD_POPUP";

const SCROLL_THRESHOLD = 0.3;
const DWELL_MS = 15_000;

type Stage = "teaser" | "form";

/** Local calendar hour (YYYY-MM-DD-HH). Dismiss hides the popup until the next clock hour. */
function hourSlotKey() {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${date}-${String(d.getHours()).padStart(2, "0")}`;
}

function shouldSuppressPath(pathname: string) {
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/contact" || pathname.startsWith("/contact/")) return true;
  if (pathname.startsWith("/auth")) return true;
  // Interactive tool pages — CTAs open the lead modal; avoid stacking auto slide-in.
  if (
    pathname === "/solar-panel-cleaning-robot-price-calculator" ||
    pathname.startsWith("/solar-panel-cleaning-robot-price-calculator/")
  ) {
    return true;
  }
  return false;
}

function devLeadPopupBypass(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEBUG_LEAD_POPUP_KEY) === "1";
  } catch {
    return false;
  }
}

function readDismissedThisHour(): boolean {
  if (devLeadPopupBypass()) return false;
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_DISMISS_SLOT) === hourSlotKey();
  } catch {
    return false;
  }
}

export default function SiteLeadSlideIn() {
  const pathname = usePathname();
  const leadModalCtx = useContext(LeadModalContext);
  const leadModalOpen = leadModalCtx?.state.isOpen ?? false;
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("teaser");
  const [eligible, setEligible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dwellDone = useRef(false);
  const scrollDone = useRef(false);
  const slideInTracked = useRef(false);
  const leadModalOpenRef = useRef(leadModalOpen);
  const prevLeadModalOpenRef = useRef(leadModalOpen);

  useEffect(() => {
    leadModalOpenRef.current = leadModalOpen;
  }, [leadModalOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tryOpen = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!eligible) return;
    if (leadModalOpenRef.current) return;
    if (readDismissedThisHour()) return;
    if (!dwellDone.current || !scrollDone.current) return;
    if (!slideInTracked.current) {
      slideInTracked.current = true;
      trackSlideInOpen({ pagePath: pathname });
    }
    setOpen(true);
  }, [eligible, pathname]);

  const handleDismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_DISMISS_SLOT, hourSlotKey());
    } catch {
      /* ignore quota */
    }
    setOpen(false);
    setEligible(false);
    setStage("teaser");
  }, []);

  const handleSuccess = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_DISMISS_SLOT, hourSlotKey());
    } catch {
      /* ignore quota */
    }
    // Let the user see the inline thank-you panel before we close.
    window.setTimeout(() => {
      setOpen(false);
      setEligible(false);
      setStage("teaser");
    }, 2800);
  }, []);

  useEffect(() => {
    if (shouldSuppressPath(pathname)) {
      setEligible(false);
      setOpen(false);
      return;
    }
    if (readDismissedThisHour()) {
      setEligible(false);
      return;
    }
    dwellDone.current = false;
    scrollDone.current = false;
    setEligible(true);
  }, [pathname]);

  useEffect(() => {
    if (!eligible) return;

    const t = window.setTimeout(() => {
      dwellDone.current = true;
      tryOpen();
    }, DWELL_MS);

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        scrollDone.current = true;
      } else {
        const ratio = window.scrollY / scrollable;
        if (ratio >= SCROLL_THRESHOLD) scrollDone.current = true;
      }
      tryOpen();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [eligible, tryOpen]);

  useEffect(() => {
    if (open) setStage("teaser");
  }, [open]);

  // Lead modal takes priority — hide slide-in so closing the modal does not leave a second popup.
  useEffect(() => {
    const wasOpen = prevLeadModalOpenRef.current;
    if (leadModalOpen) {
      setOpen(false);
    } else if (wasOpen) {
      setOpen(false);
    }
    prevLeadModalOpenRef.current = leadModalOpen;
  }, [leadModalOpen]);

  useEffect(() => {
    if (!open || leadModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", onKey);
    const unlockScroll = lockPageScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, leadModalOpen, handleDismiss]);

  if (shouldSuppressPath(pathname)) return null;
  if (!eligible) return null;
  if (leadModalOpen) return null;
  if (!open) return null;
  if (!mounted) return null;

  const titleId = stage === "teaser" ? "taypro-slidein-title" : "taypro-slidein-form-title";

  const panel = (
    <div className="taypro-lead-slidein-root">
      <div
        className="taypro-lead-backdrop absolute inset-0 bg-[#052638]/55 backdrop-blur-[3px]"
        aria-hidden="true"
        onClick={handleDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="taypro-lead-slidein-panel rounded-2xl border border-white/10 bg-white shadow-[0_24px_80px_-12px_rgba(5,38,56,0.45)]"
      >
        {stage === "teaser" ? (
          <>
            <div className="taypro-lead-slidein-hero relative flex min-h-0 shrink-0 flex-col overflow-hidden bg-gradient-to-br from-[#021a24] via-[#052638] to-[#0a4a66]">
              <Image
                src="/tayproasset/taypro-robotImage.png"
                alt=""
                fill
                className="pointer-events-none object-cover object-center opacity-35 mix-blend-luminosity scale-105"
                sizes="416px"
                priority={false}
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#052638] via-[#052638]/80 via-40% to-transparent" />
              <div className="relative z-20 flex shrink-0 items-center justify-end px-2 pt-2 sm:px-3 sm:pt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] sm:h-10 sm:w-10"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none" aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>
              <div className="relative z-10 px-3 pb-2.5 pt-0 sm:px-5 sm:pb-4">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8C117] sm:text-sm">
                    Taypro plant check
                  </p>
                  <span className="rounded-full bg-[#A8C117]/20 px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-[#d4e884] ring-1 ring-[#A8C117]/40 sm:text-xs sm:px-3 sm:py-1">
                    Free · 1 min
                  </span>
                </div>
                <h2
                  id="taypro-slidein-title"
                  className="taypro-lead-slidein-title mt-1 text-lg font-semibold leading-snug text-white sm:mt-1.5 sm:text-xl"
                >
                  Turn soiling losses into a clear next step
                </h2>
              </div>
            </div>

            <div className="taypro-lead-slidein-scroll flex flex-col bg-gradient-to-b from-white to-[#f4f7f8] px-3 pb-3 pt-2.5 sm:px-5 sm:pb-5 sm:pt-4">
              <p className="taypro-lead-slidein-intro-mobile text-xs leading-snug text-[#22405a]">
                Quick, no-pressure fit check — model, layout &amp; economics for your MW.
              </p>
              <p className="taypro-lead-slidein-intro text-sm leading-relaxed text-[#22405a] sm:text-base">
                You&apos;ve already shown you care about the details. Here&apos;s a{" "}
                <span className="font-semibold text-[#052638]">no-pressure fit check</span>. We connect what
                you&apos;re browsing to{" "}
                <span className="font-semibold text-[#052638]">robot model, layout, and rough economics</span> for
                your MW. Then you decide if a deeper conversation makes sense.
              </p>

              <ul className="mt-2 space-y-1 sm:mt-4 sm:space-y-2">
                {PLANT_CHECK_PERKS.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="taypro-lead-slidein-perk-item flex gap-2 rounded-xl border border-[#e2e8ec] bg-white/90 px-2.5 py-2 shadow-sm sm:gap-3 sm:px-3.5 sm:py-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#052638] text-[#A8C117] sm:mt-0.5 sm:h-9 sm:w-9">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold leading-snug text-[#052638] sm:text-sm">
                        {title}
                      </span>
                      <span className="taypro-lead-slidein-perk-detail mt-0.5 block text-sm leading-snug text-[#4a6574]">
                        {text}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-2.5 flex shrink-0 flex-col gap-1 sm:mt-5 sm:gap-1.5">
                <button
                  type="button"
                  onClick={() => setStage("form")}
                  className="w-full rounded-xl bg-[#A8C117] py-2.5 text-center text-sm font-semibold text-[#052638] shadow-md transition hover:bg-[#b8cf3d] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#052638] focus-visible:ring-offset-2 sm:py-3.5 sm:text-lg"
                >
                  Yes, show me my fit check
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="taypro-lead-slidein-later py-1 text-center text-sm font-medium text-[#5c7582] underline-offset-2 hover:text-[#052638] hover:underline sm:py-1.5 sm:text-base"
                >
                  Show me later
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            <div className="shrink-0 border-b border-[#e8eef1] bg-gradient-to-r from-[#052638] to-[#0a3d52] px-3 py-2 sm:px-5 sm:py-3">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStage("teaser")}
                  className="inline-flex items-center gap-1.5 rounded-lg py-0.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] sm:gap-2 sm:py-1 sm:text-base"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                  Back
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                  className="relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] sm:h-11 sm:w-11"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>
              <h2
                id="taypro-slidein-form-title"
                className="mt-1 text-base font-semibold leading-snug text-white sm:mt-2 sm:text-xl"
              >
                Where should we send your fit check?
              </h2>
              <p className="taypro-lead-slidein-form-header-desc mt-1.5 text-sm leading-relaxed text-[#b8d4e0]">
                A few fields. Then our team can reply with model direction and questions worth answering on a call.
              </p>
            </div>
            <div className="taypro-lead-slidein-scroll px-3 py-2 sm:px-5 sm:py-4">
              <RequestEstimateForm
                variant="embedded"
                showEmbeddedHeading={false}
                stackedEmbedded
                compactEmbedded
                slideInMobile
                analyticsFormType="slide_in"
                messageRows={2}
                messageLabel="What should we know about your plant?"
                messagePlaceholder="MW, fixed-tilt or trackers, soiling or water limits, how you clean today, and what you want to improve."
                submitLabel="Send my fit check"
                autoFocus
                hideResetAfterSuccess
                thankYouTitle="Got it, your fit check is on the way"
                thankYouMessage="Our applications team will follow up shortly with the right Solar Panel Cleaning Robot direction for your plant."
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(panel, getOverlayPortalRoot());
}

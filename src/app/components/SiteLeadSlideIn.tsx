"use client";

import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { PLANT_CHECK_PERKS } from "@/app/components/plantCheckPerks";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

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
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("teaser");
  const [eligible, setEligible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dwellDone = useRef(false);
  const scrollDone = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tryOpen = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!eligible) return;
    if (readDismissedThisHour()) return;
    if (!dwellDone.current || !scrollDone.current) return;
    setOpen(true);
  }, [eligible]);

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleDismiss]);

  if (shouldSuppressPath(pathname)) return null;
  if (!eligible) return null;
  if (!open) return null;
  if (!mounted) return null;

  const titleId = stage === "teaser" ? "taypro-slidein-title" : "taypro-slidein-form-title";

  const panel = (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center sm:items-end sm:justify-end pointer-events-auto p-4 pb-24 sm:pb-6 sm:p-6">
      <button
        type="button"
        className="taypro-lead-backdrop absolute inset-0 bg-[#052638]/55 backdrop-blur-[3px]"
        aria-label="Close"
        onClick={handleDismiss}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="taypro-lead-panel relative z-10 flex w-full max-w-[26rem] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_80px_-12px_rgba(5,38,56,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        {stage === "teaser" ? (
          <>
            <div className="relative h-40 shrink-0 overflow-hidden bg-gradient-to-br from-[#021a24] via-[#052638] to-[#0a4a66] sm:h-44">
              <Image
                src="/tayproasset/taypro-robotImage.png"
                alt=""
                fill
                className="object-cover object-center opacity-35 mix-blend-luminosity scale-105"
                sizes="416px"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#052638] via-transparent to-transparent" />
              <div className="absolute top-3 right-3 flex items-center gap-2 sm:top-4 sm:right-4">
                <span className="rounded-full bg-[#A8C117]/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#d4e884] ring-1 ring-[#A8C117]/40 sm:text-sm sm:px-3.5 sm:py-1.5">
                  Free, about 1 minute
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
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
                  Taypro plant check
                </p>
                <h2
                  id="taypro-slidein-title"
                  className="mt-1.5 text-xl font-semibold leading-snug text-white sm:text-2xl md:text-[1.65rem] md:leading-tight"
                >
                  Turn soiling losses into a clear next step
                </h2>
              </div>
            </div>

            <div className="flex flex-col bg-gradient-to-b from-white to-[#f4f7f8] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
              <p className="text-base leading-relaxed text-[#22405a] sm:text-lg">
                You&apos;ve already shown you care about the details. Here&apos;s a{" "}
                <span className="font-semibold text-[#052638]">no-pressure fit check</span>. We connect what
                you&apos;re browsing to{" "}
                <span className="font-semibold text-[#052638]">robot model, layout, and rough economics</span> for
                your MW. Then you decide if a deeper conversation makes sense.
              </p>

              <ul className="mt-5 space-y-3 sm:mt-6">
                {PLANT_CHECK_PERKS.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex gap-3 rounded-xl border border-[#e2e8ec] bg-white/90 px-3 py-3 shadow-sm sm:gap-3.5 sm:px-4 sm:py-3.5"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#052638] text-[#A8C117] sm:h-10 sm:w-10">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#052638] sm:text-base">{title}</span>
                      <span className="mt-1 block text-sm leading-snug text-[#4a6574] sm:text-[0.9375rem] sm:leading-relaxed">
                        {text}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>


              <div className="mt-6 flex flex-col gap-2 sm:mt-7">
                <button
                  type="button"
                  onClick={() => setStage("form")}
                  className="w-full rounded-xl bg-[#A8C117] py-3.5 text-center text-lg font-semibold text-[#052638] shadow-md transition hover:bg-[#b8cf3d] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#052638] focus-visible:ring-offset-2 sm:py-4 sm:text-xl"
                >
                  Yes, show me my fit check
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-2 text-center text-base font-medium text-[#5c7582] underline-offset-2 hover:text-[#052638] hover:underline sm:text-lg"
                >
                  Show me later
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col bg-white">
            <div className="shrink-0 border-b border-[#e8eef1] bg-gradient-to-r from-[#052638] to-[#0a3d52] px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setStage("teaser")}
                  className="inline-flex items-center gap-2 rounded-lg py-1 text-base font-medium text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117]"
                >
                  <ArrowLeft className="h-5 w-5" aria-hidden />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A8C117] sm:h-11 sm:w-11"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
                    ×
                  </span>
                </button>
              </div>
              <h2
                id="taypro-slidein-form-title"
                className="mt-3 text-xl font-semibold leading-snug text-white sm:text-2xl"
              >
                Where should we send your fit check?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#b8d4e0] sm:text-base">
                A few fields. Then our team can reply with model direction and questions worth answering on a call.
              </p>
            </div>
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <RequestEstimateForm
                variant="embedded"
                showEmbeddedHeading={false}
                stackedEmbedded
                messageRows={2}
                messageLabel="What should we know about your plant?"
                messagePlaceholder="MW, fixed-tilt or trackers, soiling or water limits, how you clean today, and what you want to improve."
                submitLabel="Send my fit check"
                autoFocus
                redirectOnSuccess={false}
                hideResetAfterSuccess
                thankYouTitle="Got it — your fit check is on the way"
                thankYouMessage="Our applications team will follow up shortly with the right Solar Panel Cleaning Robot direction for your plant."
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

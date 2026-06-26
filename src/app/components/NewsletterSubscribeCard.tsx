"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { trackGenerateLead } from "@/lib/analytics/track-event";

interface NewsletterSubscribeCardProps {
  className?: string;
  compact?: boolean;
}

export function NewsletterSubscribeCard({
  className = "",
  compact = false,
}: NewsletterSubscribeCardProps) {
  const t = useTranslations("BlogPage.newsletter");
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<false | "new" | "existing">(false);
  const [errorMsg, setErrorMsg] = useState("");

  const wrapperClass = compact
    ? "rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
    : "rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMsg(t("requiredError"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
        alreadySubscribed?: boolean;
      };

      if (!response.ok) {
        throw new Error(payload.message || t("genericError"));
      }

      trackGenerateLead({
        formType: "newsletter_subscribe",
        pagePath: pathname,
      });

      setSubmitted(payload.alreadySubscribed ? "existing" : "new");
      setEmail("");
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : t("genericError")
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`${wrapperClass} ${className}`.trim()}
        role="status"
        aria-live="polite"
      >
        <div className="text-center py-2">
          <CheckCircle2
            className={`mx-auto text-[#5a8f00] ${compact ? "mb-2 h-8 w-8" : "mb-3 h-10 w-10"}`}
            aria-hidden
          />
          <p
            className={`font-semibold text-[#052638] ${compact ? "text-sm" : "text-base"}`}
          >
            {t("successTitle")}
          </p>
          <p className={`text-gray-600 mt-1 ${compact ? "text-xs" : "text-sm"}`}>
            {submitted === "existing"
              ? t("alreadySubscribedMessage")
              : t("successMessage")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <div className="rounded-lg bg-gradient-to-r from-[#f5f8fb] to-[#eef3f8] border border-gray-100 px-3 py-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 items-center rounded-full bg-[#052638] px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            {t("badge")}
          </span>
          <span className="text-[11px] text-[#0c3c57]/80 font-medium">
            {t("frequency")}
          </span>
        </div>
        <p className="text-sm font-semibold text-[#052638] mt-2 leading-snug">
          {t("title")}
        </p>
        <p className="text-xs text-gray-600 mt-1">{t("description")}</p>
      </div>

      <form onSubmit={handleSubmit} aria-label={t("formLabel")}>
        <label htmlFor="newsletter-email" className="sr-only">
          {t("emailLabel")}
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg) setErrorMsg("");
          }}
          placeholder={t("emailPlaceholder")}
          disabled={loading}
          className={`w-full rounded-md border border-gray-300 bg-white text-[#052638] placeholder:text-gray-400 focus:border-[#052638] focus:outline-none focus:ring-1 focus:ring-[#052638] disabled:opacity-60 ${
            compact ? "px-3 py-2 text-sm" : "px-3 py-2.5 text-sm"
          }`}
        />

        {errorMsg ? (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {errorMsg}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={`mt-2 inline-flex w-full items-center justify-center rounded-md bg-[#052638] font-medium text-white transition hover:bg-[#0c3d56] disabled:cursor-not-allowed disabled:opacity-70 ${
            compact ? "px-4 py-2 text-sm" : "px-4 py-3 text-sm"
          }`}
        >
          {loading ? t("submitting") : t("cta")}
        </button>
      </form>
    </div>
  );
}
